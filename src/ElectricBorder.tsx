import React, { useState, useCallback } from "react";
import { StyleSheet, View, ViewStyle, LayoutChangeEvent } from "react-native";
import { Canvas, Path, Skia, Group, Blur } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  useFrameCallback,
} from "react-native-reanimated";

interface ElectricBorderProps {
  children: React.ReactNode;
  borderRadius?: number;
  color?: string;
  speed?: number;
  chaos?: number;
  containerStyle?: ViewStyle;
  strokeWidth?: number;
}

const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  borderRadius = 12,
  color = "#7df9ff",
  speed = 0.5,
  chaos = 0.5,
  containerStyle,
  strokeWidth = 1,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const time = useSharedValue(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  useFrameCallback((frameInfo) => {
    if (frameInfo.timeSincePreviousFrame) {
      time.value += (frameInfo.timeSincePreviousFrame / 1000) * speed;
    }
  });

  const path = useDerivedValue(() => {
    "worklet";

    if (dimensions.width === 0 || dimensions.height === 0) {
      return Skia.Path.Make();
    }

    const { width, height } = dimensions;
    const padding = 60;
    const radius = Math.min(borderRadius, Math.min(width, height) / 2);

    const octaves = 10;
    const lacunarity = 1.6;
    const gain = 0.7;
    const baseAmplitude = chaos;
    const baseFrequency = 10;
    const baseFlatness = 0;
    const displacement = 10;

    const random = (x: number) => {
      "worklet";
      const val = Math.sin(x * 12.9898) * 43758.5453123;
      return val % 1;
    };

    const noise2D = (x: number, y: number) => {
      "worklet";
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;

      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);

      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);

      return (
        a * (1 - ux) * (1 - uy) +
        b * ux * (1 - uy) +
        c * (1 - ux) * uy +
        d * ux * uy
      );
    };

    const octavedNoise = (x: number, t: number, seed: number) => {
      "worklet";
      let y = 0;
      let amp = baseAmplitude;
      let freq = baseFrequency;

      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amp;
        if (i === 0) {
          octaveAmplitude *= baseFlatness;
        }
        y += octaveAmplitude * noise2D(freq * x + seed * 100, t * freq * 0.3);
        freq *= lacunarity;
        amp *= gain;
      }
      return y;
    };

    const getCornerPoint = (
      centerX: number,
      centerY: number,
      r: number,
      startAngle: number,
      arcLength: number,
      progress: number,
    ) => {
      "worklet";
      const angle = startAngle + progress * arcLength;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    };

    const getRoundedRectPoint = (t: number) => {
      "worklet";
      const straightWidth = width - 2 * radius;
      const straightHeight = height - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter =
        2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = t * totalPerimeter;

      let acc = 0;
      const left = padding;
      const top = padding;

      // Top edge
      if (distance <= acc + straightWidth) {
        const p = (distance - acc) / straightWidth;
        return { x: left + radius + p * straightWidth, y: top };
      }
      acc += straightWidth;

      // Top-right corner
      if (distance <= acc + cornerArc) {
        const p = (distance - acc) / cornerArc;
        return getCornerPoint(
          left + width - radius,
          top + radius,
          radius,
          -Math.PI / 2,
          Math.PI / 2,
          p,
        );
      }
      acc += cornerArc;

      // Right edge
      if (distance <= acc + straightHeight) {
        const p = (distance - acc) / straightHeight;
        return { x: left + width, y: top + radius + p * straightHeight };
      }
      acc += straightHeight;

      // Bottom-right corner
      if (distance <= acc + cornerArc) {
        const p = (distance - acc) / cornerArc;
        return getCornerPoint(
          left + width - radius,
          top + height - radius,
          radius,
          0,
          Math.PI / 2,
          p,
        );
      }
      acc += cornerArc;

      // Bottom edge
      if (distance <= acc + straightWidth) {
        const p = (distance - acc) / straightWidth;
        return {
          x: left + width - radius - p * straightWidth,
          y: top + height,
        };
      }
      acc += straightWidth;

      // Bottom-left corner
      if (distance <= acc + cornerArc) {
        const p = (distance - acc) / cornerArc;
        return getCornerPoint(
          left + radius,
          top + height - radius,
          radius,
          Math.PI / 2,
          Math.PI / 2,
          p,
        );
      }
      acc += cornerArc;

      // Left edge
      if (distance <= acc + straightHeight) {
        const p = (distance - acc) / straightHeight;
        return { x: left, y: top + height - radius - p * straightHeight };
      }
      acc += straightHeight;

      const p2 = (distance - acc) / cornerArc;
      return getCornerPoint(
        left + radius,
        top + radius,
        radius,
        Math.PI,
        Math.PI / 2,
        p2,
      );
    };

    const skPath = Skia.Path.Make();
    const approxPerimeter = 2 * (width + height) + 2 * Math.PI * radius;
    const samples = Math.floor(approxPerimeter / 2);

    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const point = getRoundedRectPoint(progress);

      const xNoise = octavedNoise(progress * 8, time.value, 0);
      const yNoise = octavedNoise(progress * 8, time.value, 1);

      const dx = point.x + xNoise * displacement;
      const dy = point.y + yNoise * displacement;

      if (i === 0) {
        skPath.moveTo(dx, dy);
      } else {
        skPath.lineTo(dx, dy);
      }
    }
    skPath.close();
    return skPath;
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <View onLayout={onLayout} style={[styles.content]}>
        {children}
      </View>
      <Canvas
        style={[
          styles.canvas,
          {
            width: dimensions.width + 120,
            height: dimensions.height + 120,
          },
        ]}
      >
        <Group>
          <Blur blur={6} />
          <Path
            path={path}
            color={color}
            style="stroke"
            strokeWidth={strokeWidth * 4}
          />
        </Group>
        <Group>
          <Blur blur={2} />
          <Path
            path={path}
            color={color}
            style="stroke"
            strokeWidth={strokeWidth * 2}
          />
        </Group>
        <Path
          path={path}
          color="#fff"
          style="stroke"
          strokeWidth={strokeWidth}
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignSelf: "flex-start",
    // position: "relative",
  },
  content: {
    zIndex: 1,
  },
  canvas: {
    position: "absolute",
    left: -60,
    top: -60,
    pointerEvents: "none",
  },
});

export { ElectricBorder };
export type { ElectricBorderProps };
