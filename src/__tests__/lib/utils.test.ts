import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  formatDuration,
  formatFileSize,
  formatPhoneNumber,
  truncate,
  slugify,
  generateOrderNumber,
  getInitials,
  getOrderStatusColor,
  getQCStatusColor,
  calculateDistance,
  debounce,
  groupBy,
} from '@/lib/utils';

describe('cn (className merger)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-99.99)).toBe('-$99.99');
  });
});

describe('formatDate', () => {
  it('should format date string', () => {
    expect(formatDate('2026-01-22')).toBe('Jan 22, 2026');
  });

  it('should format Date object', () => {
    expect(formatDate(new Date('2026-01-22'))).toBe('Jan 22, 2026');
  });

  it('should accept custom format', () => {
    expect(formatDate('2026-01-22', 'yyyy/MM/dd')).toBe('2026/01/22');
  });
});

describe('formatTime', () => {
  it('should format 24h time to 12h', () => {
    expect(formatTime('14:30')).toBe('2:30 PM');
    expect(formatTime('09:00')).toBe('9:00 AM');
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });
});

describe('formatDuration', () => {
  it('should format minutes only', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('should format hours only', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });

  it('should handle zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

describe('formatPhoneNumber', () => {
  it('should format 10-digit US number', () => {
    expect(formatPhoneNumber('4045551234')).toBe('(404) 555-1234');
  });

  it('should format 11-digit US number with country code', () => {
    expect(formatPhoneNumber('14045551234')).toBe('+1 (404) 555-1234');
  });

  it('should return original for other formats', () => {
    expect(formatPhoneNumber('123')).toBe('123');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Hi', 5)).toBe('Hi');
  });
});

describe('slugify', () => {
  it('should convert to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });
});

describe('generateOrderNumber', () => {
  it('should generate unique order numbers', () => {
    const order1 = generateOrderNumber();
    const order2 = generateOrderNumber();
    
    expect(order1).toMatch(/^ORD-[A-Z0-9]+$/);
    expect(order2).toMatch(/^ORD-[A-Z0-9]+$/);
    expect(order1).not.toBe(order2);
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should limit to 2 characters', () => {
    expect(getInitials('John Paul Smith')).toBe('JP');
  });
});

describe('getOrderStatusColor', () => {
  it('should return correct color for scheduled', () => {
    expect(getOrderStatusColor('scheduled')).toContain('indigo');
  });

  it('should return correct color for delivered', () => {
    expect(getOrderStatusColor('delivered')).toContain('green');
  });

  it('should return default for unknown status', () => {
    expect(getOrderStatusColor('unknown')).toContain('gray');
  });
});

describe('getQCStatusColor', () => {
  it('should return correct color for passed', () => {
    expect(getQCStatusColor('passed')).toContain('emerald');
  });

  it('should return correct color for failed', () => {
    expect(getQCStatusColor('failed')).toContain('red');
  });
});

describe('calculateDistance', () => {
  it('should calculate distance between two points', () => {
    // Atlanta to New York (approximately 750 miles)
    const distance = calculateDistance(33.749, -84.388, 40.7128, -74.006);
    expect(distance).toBeGreaterThan(700);
    expect(distance).toBeLessThan(800);
  });

  it('should return 0 for same point', () => {
    const distance = calculateDistance(33.749, -84.388, 33.749, -84.388);
    expect(distance).toBe(0);
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('should debounce function calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('groupBy', () => {
  it('should group array by key', () => {
    const items = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ];

    const grouped = groupBy(items, 'type');

    expect(grouped).toEqual({
      a: [
        { type: 'a', value: 1 },
        { type: 'a', value: 3 },
      ],
      b: [{ type: 'b', value: 2 }],
    });
  });
});
