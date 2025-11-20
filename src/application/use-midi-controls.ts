import { useMidi } from '../ui/composables/useMidiStore';

/**
 * Application service for MIDI control actions used by views.
 * Decouples UI components from the store by exposing only the needed API.
 */
export function useMidiControls() {
  const midi = useMidi();

  function sendControlChange(controller: number, value: number, options?: { channel?: number }) {
    return midi.sendControlChange(controller, value, options);
  }

  function sendProgramChange(program: number, options?: { channel?: number }) {
    return midi.sendProgramChange(program, options);
  }

  return {
    sendControlChange,
    sendProgramChange,
  } as const;
}
