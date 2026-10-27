// Compatibility exports; native implementation belongs to the selected profile.
export {
  runCodexDiagnostics,
  runTrustedCodexFixtureDiagnostics,
  runCodexAcceptance,
  parseNative,
  reviewNativeProposal,
  isNativeNodeTest,
  captureNativeSources,
} from './profiles/codex/index.ts';
