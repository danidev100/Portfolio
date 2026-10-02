'use client';

import { Line } from '@react-three/drei';
import { invalidate, useFrame, useThree } from '@react-three/fiber';
import { motion, useReducedMotion } from 'motion/react';
import {
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Vector3, type Group, type MeshBasicMaterial } from 'three';

import {
  CameraRig,
  clampFrameDelta,
  fitPoseToAspect,
  getDampingFactor,
  getFocusView,
  getNearestAngle,
  readThemeColor,
  SceneCanvas,
  SETTLE_EPSILON,
  useDampedValue,
  type CameraPose,
} from '@/scene';
import { cn } from '@/shared/util/cn';

import type { GraphEdge, GraphNode } from '../util/graph';
import { layoutGraph, type Position } from '../util/graphLayout';
import { NODE_TYPE_STYLES } from './nodeTypeStyles';

const HOME_POSE: CameraPose = { position: [0, 0.4, 8.2], lookAt: [0, 0, 0] };
/** The graph is framed for a stage at least this wide relative to its height. */
const MINIMUM_ASPECT = 1.3;

const RADIANS_PER_PIXEL = 0.008;
const YAW_DAMPING = 5;

const DIMMED_OPACITY = 0.15;
const HALO_SCALE = 2.2;
const HALO_OPACITY = { resting: 0.08, highlighted: 0.22 } as const;
const EDGE_OPACITY = { resting: 0.22, highlighted: 0.75, dimmed: 0.04 } as const;
/** Gap between the top of a node and its label, in world units. */
const LABEL_GAP = 0.14;
/** Labels nearer to the camera are stacked above the ones farther away. */
const LABEL_DEPTH_LAYERS = 1000;

type LabelElements = Map<string, HTMLLIElement>;

interface GraphNodeMeshProps {
  node: GraphNode;
  position: Position;
  /** Another set of nodes is in focus and this one is not part of it. */
  isDimmed: boolean;
  isHighlighted: boolean;
}

function GraphNodeMesh({ node, position, isDimmed, isHighlighted }: GraphNodeMeshProps): ReactNode {
  const style = NODE_TYPE_STYLES[node.type];
  const color = readThemeColor(style.colorVariable);
  const coreRef = useRef<MeshBasicMaterial>(null);
  const haloRef = useRef<MeshBasicMaterial>(null);
  const haloOpacity = isHighlighted ? HALO_OPACITY.highlighted : HALO_OPACITY.resting;

  useDampedValue(isDimmed ? DIMMED_OPACITY : 1, (opacity) => {
    if (coreRef.current) coreRef.current.opacity = opacity;
  });
  useDampedValue(isDimmed ? 0 : haloOpacity, (opacity) => {
    if (haloRef.current) haloRef.current.opacity = opacity;
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[style.size, 24, 16]} />
        <meshBasicMaterial ref={coreRef} color={color} transparent />
      </mesh>
      <mesh>
        <sphereGeometry args={[style.size * HALO_SCALE, 16, 12]} />
        <meshBasicMaterial ref={haloRef} color={color} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

interface GraphEdgeLineProps {
  from: Position;
  to: Position;
  color: string;
  opacity: number;
}

function GraphEdgeLine({ from, to, color, opacity }: GraphEdgeLineProps): ReactNode {
  const lineRef = useRef<ComponentRef<typeof Line>>(null);

  useDampedValue(opacity, (value) => {
    if (lineRef.current) lineRef.current.material.opacity = value;
  });

  return <Line ref={lineRef} points={[from, to]} color={color} lineWidth={1} transparent />;
}

interface LabelProjectorProps {
  nodes: readonly GraphNode[];
  layout: ReadonlyMap<string, Position>;
  groupRef: RefObject<Group | null>;
  labelElementsRef: RefObject<LabelElements>;
}

/**
 * Keeps each DOM label over its node. It runs in the render loop, after the
 * camera and the graph have moved, and writes straight to the elements, so
 * following the scene costs no React render.
 */
function LabelProjector({ nodes, layout, groupRef, labelElementsRef }: LabelProjectorProps): null {
  const anchorRef = useRef(new Vector3());

  useFrame(({ camera, size }) => {
    const group = groupRef.current;
    if (!group) return;

    // Both moved earlier in this frame, and three.js would only refresh their
    // matrices when it renders, which is after this callback.
    group.updateMatrixWorld();
    camera.updateMatrixWorld();

    for (const node of nodes) {
      const element = labelElementsRef.current.get(node.id);
      const position = layout.get(node.id);
      if (!element || !position) continue;

      const anchor = anchorRef.current
        .set(position[0], position[1] + NODE_TYPE_STYLES[node.type].size + LABEL_GAP, position[2])
        .applyMatrix4(group.matrixWorld)
        .project(camera);
      const x = (anchor.x * 0.5 + 0.5) * size.width;
      const y = (0.5 - anchor.y * 0.5) * size.height;

      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      element.style.zIndex = String(Math.round((1 - anchor.z) * LABEL_DEPTH_LAYERS));
    }
  });

  return null;
}

interface GraphStageProps {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  layout: ReadonlyMap<string, Position>;
  activeIds: ReadonlySet<string>;
  labelElementsRef: RefObject<LabelElements>;
  /** Rotation the visitor has added by dragging, in radians. */
  dragYawRef: RefObject<number>;
  isMotionReduced: boolean;
}

function GraphStage({
  nodes,
  edges,
  layout,
  activeIds,
  labelElementsRef,
  dragYawRef,
  isMotionReduced,
}: GraphStageProps): ReactNode {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const groupRef = useRef<Group>(null);
  /** Rotation that faces the nodes in focus toward the camera. */
  const focusYawRef = useRef(0);

  const focusView = useMemo(() => {
    const focusPositions = [...activeIds].flatMap((id) => {
      const position = layout.get(id);

      return position ? [position] : [];
    });

    return getFocusView(focusPositions, MINIMUM_ASPECT);
  }, [activeIds, layout]);
  // The rig restarts its motion whenever the pose object changes.
  const pose = useMemo(
    () => fitPoseToAspect(focusView?.pose ?? HOME_POSE, aspect, MINIMUM_ASPECT),
    [focusView, aspect],
  );
  const edgeColors = useMemo(
    () => ({
      resting: readThemeColor('--color-primary'),
      highlighted: readThemeColor('--color-ai'),
    }),
    [],
  );

  useEffect(() => {
    const currentYaw = groupRef.current?.rotation.y ?? 0;
    // A new focus turns the graph by the short way and discards the drag; going
    // back to the overview leaves the graph as the visitor last saw it.
    focusYawRef.current = focusView ? getNearestAngle(currentYaw, focusView.yaw) : currentYaw;
    dragYawRef.current = 0;
    invalidate();
  }, [focusView, dragYawRef]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const targetYaw = focusYawRef.current + dragYawRef.current;
    const remaining = targetYaw - group.rotation.y;
    if (remaining === 0) return;

    const factor = isMotionReduced ? 1 : getDampingFactor(YAW_DAMPING, clampFrameDelta(delta));
    const isArriving = Math.abs(remaining * (1 - factor)) < SETTLE_EPSILON;
    group.rotation.y = isArriving ? targetYaw : group.rotation.y + remaining * factor;
    if (!isArriving) invalidate();
  });

  const hasFocus = activeIds.size > 0;

  return (
    <>
      <CameraRig pose={pose} isMotionReduced={isMotionReduced} />
      <group ref={groupRef}>
        {edges.map(([fromId, toId]) => {
          const from = layout.get(fromId);
          const to = layout.get(toId);
          if (!from || !to) return null;

          const isHighlighted = activeIds.has(fromId) && activeIds.has(toId);
          const focusedOpacity = isHighlighted ? EDGE_OPACITY.highlighted : EDGE_OPACITY.dimmed;

          return (
            <GraphEdgeLine
              key={`${fromId}-${toId}`}
              from={from}
              to={to}
              color={isHighlighted ? edgeColors.highlighted : edgeColors.resting}
              opacity={hasFocus ? focusedOpacity : EDGE_OPACITY.resting}
            />
          );
        })}
        {nodes.map((node) => {
          const position = layout.get(node.id);
          if (!position) return null;

          return (
            <GraphNodeMesh
              key={node.id}
              node={node}
              position={position}
              isDimmed={hasFocus && !activeIds.has(node.id)}
              isHighlighted={activeIds.has(node.id)}
            />
          );
        })}
      </group>
      {/* Last, so that it runs once the camera and the graph have moved. */}
      <LabelProjector
        nodes={nodes}
        layout={layout}
        groupRef={groupRef}
        labelElementsRef={labelElementsRef}
      />
    </>
  );
}

interface ExperienceGraphProps {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  /** Nodes in focus; must keep its identity while the focus does not change. */
  activeNodeIds: readonly string[];
  onSelectNode: (nodeId: string) => void;
}

/**
 * The experience as a 3D graph in its own canvas. The camera flies to the
 * nodes in focus, and dragging turns the graph. The nodes are labelled with
 * real buttons laid over the canvas: sharp at any zoom and usable by anyone.
 */
export function ExperienceGraph({
  nodes,
  edges,
  activeNodeIds,
  onSelectNode,
}: ExperienceGraphProps): ReactNode {
  const isMotionReduced = useReducedMotion() ?? false;
  const dragYawRef = useRef(0);
  // A drag ends with a click on whatever label is under the pointer.
  const didPanRef = useRef(false);
  const labelElementsRef = useRef<LabelElements>(new Map());
  const layout = useMemo(() => layoutGraph(nodes), [nodes]);
  const activeIds = useMemo(() => new Set(activeNodeIds), [activeNodeIds]);
  const hasFocus = activeIds.size > 0;

  const labels = (
    <ul aria-label="Nodos del grafo" className="pointer-events-none absolute inset-0">
      {nodes.map((node) => (
        <li
          key={node.id}
          ref={(element) => {
            if (element) labelElementsRef.current.set(node.id, element);
            else labelElementsRef.current.delete(node.id);
          }}
          className="absolute top-0 left-0 will-change-transform"
        >
          <button
            type="button"
            aria-pressed={activeIds.has(node.id)}
            onClick={() => {
              if (!didPanRef.current) onSelectNode(node.id);
            }}
            className={cn(
              'pointer-events-auto -translate-x-1/2 -translate-y-full cursor-pointer rounded-full border bg-surface/90 px-2.5 py-0.5 text-xs whitespace-nowrap transition-opacity duration-300 hover:bg-surface-raised motion-reduce:transition-none',
              NODE_TYPE_STYLES[node.type].borderClass,
              hasFocus && !activeIds.has(node.id) && 'opacity-30',
            )}
          >
            {node.label}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <motion.div
      onPointerDownCapture={() => {
        didPanRef.current = false;
      }}
      onPanStart={() => {
        didPanRef.current = true;
      }}
      onPan={(_event, info) => {
        dragYawRef.current += info.delta.x * RADIANS_PER_PIXEL;
        invalidate();
      }}
      className="size-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
    >
      <SceneCanvas overlay={labels}>
        <GraphStage
          nodes={nodes}
          edges={edges}
          layout={layout}
          activeIds={activeIds}
          labelElementsRef={labelElementsRef}
          dragYawRef={dragYawRef}
          isMotionReduced={isMotionReduced}
        />
      </SceneCanvas>
    </motion.div>
  );
}
