// Comprehensive validation utilities

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const validatePhone = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check for Indian mobile number format
  const indianMobileRegex = /^[6-9]\d{9}$/;
  
  // Handle +91 prefix
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return indianMobileRegex.test(cleanPhone.substring(2));
  }
  
  return indianMobileRegex.test(cleanPhone);
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name) => {
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true };
};

// Date validation
export const validateDate = (date, options = {}) => {
  const { 
    allowPast = false, 
    allowFuture = true, 
    minDate = null, 
    maxDate = null 
  } = options;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(inputDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (!allowPast && inputDate < today) {
    return { valid: false, error: 'Date cannot be in the past' };
  }
  
  if (!allowFuture && inputDate > today) {
    return { valid: false, error: 'Date cannot be in the future' };
  }
  
  if (minDate && inputDate < new Date(minDate)) {
    return { valid: false, error: `Date must be after ${minDate}` };
  }
  
  if (maxDate && inputDate > new Date(maxDate)) {
    return { valid: false, error: `Date must be before ${maxDate}` };
  }
  
  return { valid: true };
};

// Tournament validation
export const validateTournament = (tournament) => {
  const errors = {};
  
  // Tournament name
  if (!tournament.name || tournament.name.trim().length < 3) {
    errors.name = 'Tournament name must be at least 3 characters long';
  } else if (tournament.name.trim().length > 100) {
    errors.name = 'Tournament name must be less than 100 characters';
  }
  
  // Venue
  if (!tournament.venue || tournament.venue.trim().length < 3) {
    errors.venue = 'Venue must be at least 3 characters long';
  } else if (tournament.venue.trim().length > 200) {
    errors.venue = 'Venue must be less than 200 characters';
  }
  
  // City
  if (!tournament.city || tournament.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters long';
  }
  
  // Date
  const dateValidation = validateDate(tournament.date, { allowPast: false });
  if (!dateValidation.valid) {
    errors.date = dateValidation.error;
  }
  
  // Entry fee
  if (tournament.entry_fee && (isNaN(tournament.entry_fee) || tournament.entry_fee < 0)) {
    errors.entry_fee = 'Entry fee must be a positive number';
  }
  
  // Prize money
  if (tournament.prize_money && (isNaN(tournament.prize_money) || tournament.prize_money < 0)) {
    errors.prize_money = 'Prize money must be a positive number';
  }
  
  // Max players
  if (!tournament.max_players || ![8, 16, 32].includes(parseInt(tournament.max_players))) {
    errors.max_players = 'Max players must be 8, 16, or 32';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Category validation
export const validateCategory = (category) => {
  const errors = {};
  
  // Category name
  if (!category.category_name || category.category_name.trim().length < 3) {
    errors.category_name = 'Category name must be at least 3 characters long';
  }
  
  // Match type
  if (!category.match_type || !['singles', 'doubles', 'mixed_doubles'].includes(category.match_type)) {
    errors.match_type = 'Match type must be singles, doubles, or mixed_doubles';
  }
  
  // Entry fee
  if (category.entry_fee && (isNaN(category.entry_fee) || category.entry_fee < 0)) {
    errors.entry_fee = 'Entry fee must be a positive number';
  }
  
  // Max participants
  if (!category.max_participants || category.max_participants < 2) {
    errors.max_participants = 'Max participants must be at least 2';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Registration validation
export const validateRegistration = (registration, matchType = 'singles') => {
  const errors = {};
  
  // Player name
  const nameValidation = validateName(registration.player_name);
  if (!nameValidation.valid) {
    errors.player_name = nameValidation.error;
  }
  
  // Player email
  if (!validateEmail(registration.player_email)) {
    errors.player_email = 'Please enter a valid email address';
  }
  
  // Player phone
  if (!validatePhone(registration.player_phone)) {
    errors.player_phone = 'Please enter a valid Indian mobile number';
  }
  
  // Doubles-specific validation
  if (matchType === 'doubles' || matchType === 'mixed_doubles') {
    if (!registration.team_name || registration.team_name.trim().length < 3) {
      errors.team_name = 'Team name must be at least 3 characters long';
    }
    
    if (!registration.player2_name) {
      errors.player2_name = 'Partner name is required for doubles';
    } else {
      const partner2NameValidation = validateName(registration.player2_name);
      if (!partner2NameValidation.valid) {
        errors.player2_name = partner2NameValidation.error;
      }
    }
    
    if (!validateEmail(registration.player2_email)) {
      errors.player2_email = 'Please enter a valid email address for partner';
    }
    
    if (!validatePhone(registration.player2_phone)) {
      errors.player2_phone = 'Please enter a valid mobile number for partner';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Score validation
export const validateScore = (score1, score2, format = 'best_of_3') => {
  const errors = [];
  
  // Check if scores are numbers
  if (isNaN(score1) || isNaN(score2)) {
    errors.push('Scores must be numbers');
    return { valid: false, errors };
  }
  
  const s1 = parseInt(score1);
  const s2 = parseInt(score2);
  
  // Check for negative scores
  if (s1 < 0 || s2 < 0) {
    errors.push('Scores cannot be negative');
  }
  
  // Check for realistic scores (badminton is typically played to 21)
  if (s1 > 30 || s2 > 30) {
    errors.push('Scores seem unusually high (max expected: 30)');
  }
  
  // Check for valid winning conditions
  if (s1 === s2) {
    errors.push('Match cannot end in a tie');
  } else {
    const winner = s1 > s2 ? s1 : s2;
    const loser = s1 > s2 ? s2 : s1;
    
    // Standard badminton rules
    if (winner < 21) {
      errors.push('Winner must score at least 21 points');
    } else if (winner === 21 && loser > 19) {
      errors.push('If winner scores 21, loser can have maximum 19 points');
    } else if (winner > 21 && (winner - loser) !== 2) {
      errors.push('If score goes beyond 21, winner must win by exactly 2 points');
    } else if (winner > 30) {
      errors.push('Maximum score is 30 points');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth = 0,
    minHeight = 0,
    maxWidth = Infinity,
    maxHeight = Infinity
  } = options;
  
  const errors = [];
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  // For images, check dimensions (requires async validation)
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          errors.push(`Image must be at least ${minWidth}x${minHeight} pixels`);
        }
        if (img.width > maxWidth || img.height > maxHeight) {
          errors.push(`Image must be no larger than ${maxWidth}x${maxHeight} pixels`);
        }
        
        resolve({
          valid: errors.length === 0,
          errors,
          dimensions: { width: img.width, height: img.height }
        });
      };
      img.onerror = () => {
        errors.push('Invalid image file');
        resolve({ valid: false, errors });
      };
      img.src = URL.createObjectURL(file);
    });
  }
  
  return Promise.resolve({
    valid: errors.length === 0,
    errors
  });
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate and sanitize form data
export const validateAndSanitizeForm = (formData, validationRules) => {
  const sanitizedData = {};
  const errors = {};
  
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    const rules = validationRules[key];
    
    if (rules) {
      // Apply validation
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors[key] = `${key} is required`;
        return;
      }
      
      if (rules.type === 'email' && value && !validateEmail(value)) {
        errors[key] = 'Invalid email format';
        return;
      }
      
      if (rules.type === 'phone' && value && !validatePhone(value)) {
        errors[key] = 'Invalid phone number';
        return;
      }
      
      if (rules.minLength && value && value.length < rules.minLength) {
        errors[key] = `Minimum length is ${rules.minLength} characters`;
        return;
      }
      
      if (rules.maxLength && value && value.length > rules.maxLength) {
        errors[key] = `Maximum length is ${rules.maxLength} characters`;
        return;
      }
      
      if (rules.pattern && value && !rules.pattern.test(value)) {
        errors[key] = rules.patternMessage || 'Invalid format';
        return;
      }
    }
    
    // Sanitize the value
    sanitizedData[key] = typeof value === 'string' ? sanitizeInput(value.trim()) : value;
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};