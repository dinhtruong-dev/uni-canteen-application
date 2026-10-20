export * from './auth.validation';
export * from './user.validation';
export * as adminValidation from './admin/index';
export * as staffValidation from './staff/index';
export * as sharedValidation from './shared/index';

// Re-export shared validations at top-level for convenience
export * from './shared/index';
export * from './admin/index';
export * from './staff/index';

