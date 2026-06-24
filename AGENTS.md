# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## 🎨 Retro UI Typography Rules

- **Score & Number Displays**: All numeric digits displayed in the UI (e.g. scores, rank indices, stats counters, lives remaining pools) MUST use the arcade typography class (`font-arcade` / `PressStart2P-Regular`) rather than fallback/pixel fonts. Ensure that numbers are wrapped in `<Text className="font-arcade">` to enforce this rule.
