import { DetectedFormField, FieldMatchResult } from '../../types/form';
import { VaultData } from '../../types/vault';

interface FieldRule {
  path: string;
  category: keyof VaultData;
  key: string;
  label: string;
  aliases: string[];
}

const FIELD_RULES: FieldRule[] = [
  // Personal
  {
    path: 'personal.fullName',
    category: 'personal',
    key: 'fullName',
    label: 'Full Name',
    aliases: ['full name', 'candidate name', 'applicant name', 'name', 'your name', 'student name', 'legal name'],
  },
  {
    path: 'personal.firstName',
    category: 'personal',
    key: 'firstName',
    label: 'First Name',
    aliases: ['first name', 'fname', 'given name', 'forename'],
  },
  {
    path: 'personal.lastName',
    category: 'personal',
    key: 'lastName',
    label: 'Last Name',
    aliases: ['last name', 'lname', 'surname', 'family name'],
  },
  {
    path: 'personal.email',
    category: 'personal',
    key: 'email',
    label: 'Email Address',
    aliases: ['email', 'e-mail', 'mail', 'email id', 'email address', 'contact email'],
  },
  {
    path: 'personal.phone',
    category: 'personal',
    key: 'phone',
    label: 'Phone Number',
    aliases: ['phone', 'mobile', 'cell', 'telephone', 'contact number', 'phone number', 'whatsapp'],
  },
  {
    path: 'personal.dateOfBirth',
    category: 'personal',
    key: 'dateOfBirth',
    label: 'Date of Birth',
    aliases: ['date of birth', 'dob', 'birth date', 'birthday', 'birthdate'],
  },
  {
    path: 'personal.gender',
    category: 'personal',
    key: 'gender',
    label: 'Gender',
    aliases: ['gender', 'sex'],
  },

  // Address
  {
    path: 'address.addressLine',
    category: 'address',
    key: 'addressLine',
    label: 'Street Address',
    aliases: ['permanent residence', 'residence address', 'address line 1', 'address', 'street address', 'home address', 'residential address'],
  },
  {
    path: 'address.city',
    category: 'address',
    key: 'city',
    label: 'City / District',
    aliases: ['city', 'town', 'district', 'city/town'],
  },
  {
    path: 'address.state',
    category: 'address',
    key: 'state',
    label: 'State / Province',
    aliases: ['state', 'domicile state', 'domicile', 'province', 'region', 'state/ut'],
  },
  {
    path: 'address.country',
    category: 'address',
    key: 'country',
    label: 'Country',
    aliases: ['country', 'nation', 'nationality'],
  },
  {
    path: 'address.pinCode',
    category: 'address',
    key: 'pinCode',
    label: 'PIN / Postal Code',
    aliases: ['pin code', 'pincode', 'postal code', 'zip', 'zipcode', 'zip code'],
  },

  // Education
  {
    path: 'education.college',
    category: 'education',
    key: 'college',
    label: 'College / Institute',
    aliases: [
      'name of institution currently attended',
      'institution currently attended',
      'college',
      'institute',
      'college name',
      'institution name',
      'current institution',
      'school/college',
    ],
  },
  {
    path: 'education.university',
    category: 'education',
    key: 'university',
    label: 'University / Board',
    aliases: ['university', 'board', 'affiliating university', 'board/university', 'alma mater'],
  },
  {
    path: 'education.school',
    category: 'education',
    key: 'school',
    label: 'School / 10th Matriculation',
    aliases: ['school', 'matriculation', '10th school', 'secondary school', 'high school'],
  },
  {
    path: 'education.course',
    category: 'education',
    key: 'course',
    label: 'Course / Program',
    aliases: ['course', 'program', 'branch', 'stream', 'field of study', 'specialization'],
  },
  {
    path: 'education.degree',
    category: 'education',
    key: 'degree',
    label: 'Degree',
    aliases: ['degree', 'highest qualification', 'qualification', 'level of study'],
  },
  {
    path: 'education.graduationYear',
    category: 'education',
    key: 'graduationYear',
    label: 'Graduation Year',
    aliases: ['graduation year', 'year of passing', 'passing year', 'expected completion year', 'passout year'],
  },
  {
    path: 'education.studentId',
    category: 'education',
    key: 'studentId',
    label: 'Student / Roll ID',
    aliases: ['student id', 'roll number', 'roll no', 'registration number', 'usn', 'enrollment no', 'matriculation hall ticket no'],
  },
  {
    path: 'education.gpaCgpa',
    category: 'education',
    key: 'gpaCgpa',
    label: 'GPA / Aggregate %',
    aliases: ['gpa', 'cgpa', 'aggregate', 'aggregate percentage', 'percentage', 'marks', 'aggregate score', 'overall grade'],
  },

  // Professional
  {
    path: 'professional.jobTitle',
    category: 'professional',
    key: 'jobTitle',
    label: 'Job Title / Role',
    aliases: ['job title', 'designation', 'current role', 'position', 'occupation'],
  },
  {
    path: 'professional.organization',
    category: 'professional',
    key: 'organization',
    label: 'Organization / Company',
    aliases: ['organization', 'company', 'employer', 'current employer', 'workplace'],
  },
  {
    path: 'professional.skills',
    category: 'professional',
    key: 'skills',
    label: 'Skills',
    aliases: ['skills', 'key skills', 'competencies', 'technical skills', 'areas of expertise'],
  },
  {
    path: 'professional.workExperience',
    category: 'professional',
    key: 'workExperience',
    label: 'Work Experience',
    aliases: ['work experience', 'years of experience', 'experience', 'total experience'],
  },
];

export class FieldMatcher {
  /**
   * Intelligently maps detected fields to stored vault data
   */
  static matchFields(fields: DetectedFormField[], vault: VaultData): FieldMatchResult[] {
    const results: FieldMatchResult[] = [];

    fields.forEach((field) => {
      // Normalize field descriptors into a searchable string
      const searchTerms = [
        field.label,
        field.name,
        field.placeholder,
        field.ariaLabel,
        field.autocomplete,
        field.surroundingText,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      let bestMatch: FieldMatchResult | null = null;
      let highestScore = 0;

      // 1. Check Standard Rules
      for (const rule of FIELD_RULES) {
        const catObj = vault[rule.category] as unknown as Record<string, string>;
        const value = catObj ? catObj[rule.key] : '';
        if (!value || value.trim() === '') continue;

        let score = 0;
        let source: FieldMatchResult['source'] = 'semantic';

        // Check autocomplete match
        if (field.autocomplete && (field.autocomplete.includes(rule.key) || rule.aliases.includes(field.autocomplete))) {
          score = 0.98;
          source = 'exact';
        }

        // Check alias exact & substring matches
        for (const alias of rule.aliases) {
          const regex = new RegExp(`\\b${alias}\\b`, 'i');
          if (regex.test(searchTerms)) {
            // Strong match
            const aliasScore = alias.length > 5 ? 0.95 : 0.85;
            if (aliasScore > score) {
              score = aliasScore;
              source = 'alias';
            }
          } else if (searchTerms.includes(alias)) {
            const subScore = 0.78;
            if (subScore > score) {
              score = subScore;
              source = 'semantic';
            }
          }
        }

        // Special handling for dropdown / select elements
        let resolvedValue = value;
        if (field.tagName === 'select' && field.options && field.options.length > 0) {
          const matchedOpt = field.options.find(
            (opt) =>
              opt.value.toLowerCase() === value.toLowerCase() ||
              opt.label.toLowerCase() === value.toLowerCase() ||
              opt.label.toLowerCase().includes(value.toLowerCase()) ||
              value.toLowerCase().includes(opt.label.toLowerCase())
          );
          if (matchedOpt) {
            resolvedValue = matchedOpt.value;
            score = Math.max(score, 0.8);
          }
        }

        if (score > highestScore && score >= 0.65) {
          highestScore = score;
          bestMatch = {
            fieldId: field.id,
            fieldName: field.name || field.id,
            fieldLabel: field.label || field.placeholder || field.name,
            fieldType: field.type,
            suggestedValue: resolvedValue,
            vaultKeyPath: rule.path,
            vaultLabel: rule.label,
            confidence: Number(score.toFixed(2)),
            source,
            approved: score >= 0.75, // Default checked if high confidence
            selector: field.selector,
          };
        }
      }

      // 2. Check Custom Fields if no standard rule match
      if (!bestMatch && vault.customFields && vault.customFields.length > 0) {
        for (const custom of vault.customFields) {
          if (!custom.value || !custom.name) continue;
          const customNameLower = custom.name.toLowerCase();
          if (searchTerms.includes(customNameLower)) {
            bestMatch = {
              fieldId: field.id,
              fieldName: field.name || field.id,
              fieldLabel: field.label || field.placeholder || field.name,
              fieldType: field.type,
              suggestedValue: custom.value,
              vaultKeyPath: `custom.${custom.id}`,
              vaultLabel: custom.name,
              confidence: 0.88,
              source: 'alias',
              approved: true,
              selector: field.selector,
            };
            break;
          }
        }
      }

      if (bestMatch) {
        results.push(bestMatch);
      }
    });

    return results;
  }
}
