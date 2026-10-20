import { AskUnavailableError } from '../util/askErrors';
import { unavailableAskService } from './unavailableAskService';

describe('unavailableAskService', () => {
  it('answers nothing and says the AI is not available', async () => {
    const events = unavailableAskService.ask('Hola')[Symbol.asyncIterator]();

    await expect(events.next()).rejects.toBeInstanceOf(AskUnavailableError);
  });
});
