import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  dateSchema,
  timeSchema,
  timezoneSchema,
  paginationSchema,
  addressSchema,
  createCustomerSchema,
  createOrderSchema,
  validateRequest,
} from '@/lib/validation/schemas';

describe('Common Schemas', () => {
  describe('uuidSchema', () => {
    it('should accept valid UUID', () => {
      const result = uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = uuidSchema.safeParse('not-a-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('emailSchema', () => {
    it('should accept valid email', () => {
      const result = emailSchema.safeParse('user@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('user@example.com');
    });

    it('should lowercase email', () => {
      const result = emailSchema.safeParse('USER@EXAMPLE.COM');
      expect(result.success).toBe(true);
      expect(result.data).toBe('user@example.com');
    });

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid phone with country code', () => {
      const result = phoneSchema.safeParse('+14045551234');
      expect(result.success).toBe(true);
    });

    it('should be optional', () => {
      const result = phoneSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });
  });

  describe('dateSchema', () => {
    it('should accept valid date format', () => {
      const result = dateSchema.safeParse('2026-01-22');
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = dateSchema.safeParse('01-22-2026');
      expect(result.success).toBe(false);
    });
  });

  describe('timeSchema', () => {
    it('should accept HH:MM format', () => {
      const result = timeSchema.safeParse('14:30');
      expect(result.success).toBe(true);
    });

    it('should accept HH:MM:SS format', () => {
      const result = timeSchema.safeParse('14:30:00');
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = timeSchema.safeParse('2:30 PM');
      expect(result.success).toBe(false);
    });
  });

  describe('timezoneSchema', () => {
    it('should accept valid timezone', () => {
      const result = timezoneSchema.safeParse('America/New_York');
      expect(result.success).toBe(true);
    });

    it('should reject invalid timezone', () => {
      const result = timezoneSchema.safeParse('Invalid/Timezone');
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should provide defaults', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ limit: 20, offset: 0 });
    });

    it('should coerce string numbers', () => {
      const result = paginationSchema.safeParse({ limit: '50', offset: '10' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ limit: 50, offset: 10 });
    });

    it('should enforce max limit', () => {
      const result = paginationSchema.safeParse({ limit: 500 });
      expect(result.success).toBe(false);
    });
  });
});

describe('addressSchema', () => {
  it('should accept valid address', () => {
    const result = addressSchema.safeParse({
      address_line1: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      postal_code: '30301',
    });
    expect(result.success).toBe(true);
  });

  it('should require address_line1', () => {
    const result = addressSchema.safeParse({
      city: 'Atlanta',
      state: 'GA',
      postal_code: '30301',
    });
    expect(result.success).toBe(false);
  });

  it('should validate lat/lng bounds', () => {
    const result = addressSchema.safeParse({
      address_line1: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      postal_code: '30301',
      lat: 95, // Invalid
      lng: -84.388,
    });
    expect(result.success).toBe(false);
  });
});

describe('createCustomerSchema', () => {
  const validCustomer = {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe',
  };

  it('should accept valid customer', () => {
    const result = createCustomerSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it('should require email', () => {
    const { email, ...noEmail } = validCustomer;
    const result = createCustomerSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });

  it('should validate business_type enum', () => {
    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      business_type: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid business_type', () => {
    const result = createCustomerSchema.safeParse({
      ...validCustomer,
      business_type: 'agent',
    });
    expect(result.success).toBe(true);
  });
});

describe('createOrderSchema', () => {
  const validOrder = {
    customer_id: '123e4567-e89b-12d3-a456-426614174000',
    market_id: '123e4567-e89b-12d3-a456-426614174001',
    property: {
      address_line1: '123 Main St',
      city: 'Atlanta',
      state: 'GA',
      postal_code: '30301',
    },
    products: [
      { product_id: '123e4567-e89b-12d3-a456-426614174002', quantity: 1 },
    ],
  };

  it('should accept valid order', () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('should require at least one product', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      products: [],
    });
    expect(result.success).toBe(false);
  });

  it('should validate time range', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      preferred_time_start: '14:00',
      preferred_time_end: '10:00', // Before start
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid time range', () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      preferred_time_start: '10:00',
      preferred_time_end: '14:00',
    });
    expect(result.success).toBe(true);
  });
});

describe('validateRequest helper', () => {
  it('should return success with data for valid input', () => {
    const result = validateRequest(emailSchema, 'test@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should return errors for invalid input', () => {
    const result = validateRequest(emailSchema, 'not-an-email');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toBeDefined();
    }
  });
});
