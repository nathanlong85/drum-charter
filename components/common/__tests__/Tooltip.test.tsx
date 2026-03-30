import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('renders children and shows content when open', async () => {
    render(
      <TooltipPrimitive.Provider>
        <Tooltip content="Helper Text" open={true}>
          <button>Hover Me</button>
        </Tooltip>
      </TooltipPrimitive.Provider>,
    );

    const trigger = screen.getByText('Hover Me');
    expect(trigger).toBeDefined();

    // Radix may render multiple instances for accessibility (SR-only + visible)
    const elements = screen.getAllByText('Helper Text');
    expect(elements.length).toBeGreaterThan(0);
  });
});
