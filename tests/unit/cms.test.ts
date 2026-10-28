import { describe, expect, it } from 'vitest';
import { IMAGE_POSITION_OPTIONS, imagePositionCss } from '../../src/lib/media';
import { BLOCK_BY_TYPE } from '../../src/lib/blocks';

describe('image position', () => {
  it('accepts every option and falls back to center', () => {
    for (const option of IMAGE_POSITION_OPTIONS) {
      expect(imagePositionCss(option.value)).toBe(option.value);
    }
    expect(imagePositionCss('not-a-position')).toBe('center');
    expect(imagePositionCss(null)).toBe('center');
  });
});

describe('image widgets', () => {
  it('offer an image-position control', () => {
    for (const type of ['image', 'split']) {
      const field = BLOCK_BY_TYPE[type].fields.find((item) => item.name === 'imagePosition');
      expect(field?.type).toBe('select');
      expect(field?.options?.length).toBeGreaterThan(0);
    }
  });
});
