# @modhamanish/rn-electric-border

A React Native component that renders an animated electric/neon glowing border effect around any view. Built with `@shopify/react-native-skia` and `react-native-reanimated`.

## Features

- Animated electric/neon border with glow effect
- Customizable border color, speed, chaos, and border radius
- Works with any child content
- Smooth 60fps animation using Reanimated worklets
- Multi-layered glow effect using Skia blur filters

## Installation

### Step 1: Install the package

```bash
npm install @modhamanish/rn-electric-border
# or
yarn add @modhamanish/rn-electric-border
```

### Step 2: Install peer dependencies

This package requires the following peer dependencies. Make sure they are installed in your project:

```bash
npm install @shopify/react-native-skia react-native-reanimated
# or
yarn add @shopify/react-native-skia react-native-reanimated
```

> **Note:** `react` and `react-native` are also required but should already be installed in your React Native project.

### Step 3: Additional setup

- **react-native-reanimated** requires adding the Babel plugin. Add this to your `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

- **@shopify/react-native-skia** may require additional native setup. Follow the [official Skia installation guide](https://shopify.github.io/react-native-skia/docs/getting-started/installation).

### iOS

After installing, run:

```bash
cd ios && pod install
```

## Usage

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ElectricBorder from '@modhamanish/rn-electric-border';

const App = () => {
  return (
    <View style={styles.container}>
      <ElectricBorder
        borderRadius={10}
        speed={0.5}
        chaos={0.5}
        strokeWidth={1.2}
      >
        <View style={styles.card}>
          <Text style={[styles.text, styles.blueGlow]}>Electric Border</Text>
        </View>
      </ElectricBorder>

      <ElectricBorder
        borderRadius={10}
        speed={0.5}
        chaos={0.5}
        strokeWidth={1.2}
        color="#FF0000"
      >
        <View style={styles.card}>
          <Text style={[styles.text, styles.redGlow]}>Electric Border</Text>
        </View>
      </ElectricBorder>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#121212',
    gap: 40,
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 10,
  },
  text: {
    color: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
  },
  blueGlow: {
    shadowColor: '#00AEFF',
  },
  redGlow: {
    shadowColor: '#FF0000',
  },
});
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | **required** | Content to wrap with the electric border |
| `borderRadius` | `number` | `12` | Border radius of the container |
| `color` | `string` | `"#00AEFF"` | Color of the electric glow effect |
| `speed` | `number` | `0.5` | Animation speed multiplier |
| `chaos` | `number` | `0.5` | Intensity of the electric noise effect |
| `strokeWidth` | `number` | `1` | Width of the electric border stroke |
| `containerStyle` | `ViewStyle` | `undefined` | Additional styles for the outer container |

## License

ISC
