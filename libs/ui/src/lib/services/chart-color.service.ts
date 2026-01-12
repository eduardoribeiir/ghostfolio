import { Injectable } from '@angular/core';
import { ColorScheme } from '@ghostfolio/common/types';
import Color from 'color';
import OpenColor from 'open-color';

const {
  blue,
  cyan,
  grape,
  green,
  indigo,
  lime,
  orange,
  pink,
  red,
  teal,
  violet,
  yellow
} = OpenColor;

/**
 * Service responsible for managing chart colors
 * Extracted from portfolio-proportion-chart component for better reusability
 */
@Injectable()
export class ChartColorService {
  private readonly colorPalettes = {
    light: [
      blue[5],
      green[5],
      red[5],
      yellow[5],
      violet[5],
      teal[5],
      orange[5],
      pink[5],
      cyan[5],
      grape[5],
      indigo[5],
      lime[5]
    ],
    dark: [
      blue[7],
      green[7],
      red[7],
      yellow[7],
      violet[7],
      teal[7],
      orange[7],
      pink[7],
      cyan[7],
      grape[7],
      indigo[7],
      lime[7]
    ]
  };

  /**
   * Get color palette based on color scheme
   */
  public getColorPalette(colorScheme: ColorScheme): string[] {
    return this.colorPalettes[colorScheme] || this.colorPalettes.light;
  }

  /**
   * Get a specific color from the palette
   */
  public getColor(index: number, colorScheme: ColorScheme): string {
    const palette = this.getColorPalette(colorScheme);
    return palette[index % palette.length];
  }

  /**
   * Lighten a color by a ratio
   */
  public lightenColor(color: string, ratio: number): string {
    return Color(color).lighten(ratio).hex();
  }

  /**
   * Get text color based on background
   */
  public getTextColor(backgroundColor: string): string {
    return Color(backgroundColor).isDark() ? '#ffffff' : '#000000';
  }
}
