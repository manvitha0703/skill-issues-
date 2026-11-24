import { describe, it, expect } from 'vitest';
import { FieldMatcher } from '../formDetection/fieldMatcher';
import { DetectedFormField } from '../../types/form';
import { VaultData } from '../../types/vault';

describe('Smart Form Field Matching', () => {
  const sampleVault: VaultData = {
    personal: {
      firstName: 'Ananya',
      lastName: 'Sharma',
      fullName: 'Ananya Sharma',
      dateOfBirth: '2002-08-14',
      gender: 'Female',
      email: 'ananya.sharma@example.edu',
      phone: '+91 98765 43210',
    },
    address: {
      addressLine: '42 Orchid Residency, 5th Cross, Rajajinagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pinCode: '560010',
    },
    education: {
      school: 'National Public School',
      college: 'Sapthagiri NPS University',
      university: 'Visvesvaraya Technological University',
      course: 'Computer Science and Engineering',
      degree: 'Bachelor of Technology',
      graduationYear: '2026',
      studentId: '1SP22CS045',
      gpaCgpa: '9.4',
    },
    professional: {
      jobTitle: 'Software Engineering Fellow',
      skills: 'React, TypeScript, Accessibility, AI Integration',
      workExperience: '2 years',
      organization: 'Tech For All Foundation',
      resumeDetails: 'Passionate about digital inclusion',
    },
    customFields: [
      { id: 'c1', name: 'Blood Group', value: 'B+', category: 'personal' },
      { id: 'c2', name: 'Family Annual Income', value: 'INR 4,50,000', category: 'academic' },
    ],
  };

  it('matches complex academic fields (Institution Currently Attended -> College)', () => {
    const fields: DetectedFormField[] = [
      {
        id: 'f1',
        name: 'inst_attended',
        tagName: 'input',
        type: 'text',
        label: 'Name of Institution Currently Attended',
        placeholder: 'e.g. University / College name',
        ariaLabel: '',
        autocomplete: '',
        surroundingText: 'Educational background details',
        selector: '#f1',
        currentValue: '',
        isRequired: true,
        isDisabled: false,
      },
    ];

    const matches = FieldMatcher.matchFields(fields, sampleVault);
    expect(matches.length).toBe(1);
    expect(matches[0].suggestedValue).toBe('Sapthagiri NPS University');
    expect(matches[0].vaultKeyPath).toBe('education.college');
    expect(matches[0].confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('matches residency fields (Permanent Residence -> Street Address, Domicile -> State)', () => {
    const fields: DetectedFormField[] = [
      {
        id: 'addr1',
        name: 'perm_residence',
        tagName: 'textarea',
        type: 'textarea',
        label: 'Permanent Residence',
        placeholder: 'Full postal address',
        ariaLabel: '',
        autocomplete: 'street-address',
        surroundingText: 'Residential proof is required',
        selector: '#addr1',
        currentValue: '',
        isRequired: true,
        isDisabled: false,
      },
      {
        id: 'state1',
        name: 'domicile_state',
        tagName: 'input',
        type: 'text',
        label: 'Domicile State',
        placeholder: 'State of residence',
        ariaLabel: '',
        autocomplete: '',
        surroundingText: 'Select your domicile state',
        selector: '#state1',
        currentValue: '',
        isRequired: true,
        isDisabled: false,
      },
    ];

    const matches = FieldMatcher.matchFields(fields, sampleVault);
    expect(matches.length).toBe(2);

    const addrMatch = matches.find((m) => m.fieldId === 'addr1')!;
    expect(addrMatch.suggestedValue).toBe('42 Orchid Residency, 5th Cross, Rajajinagar');

    const stateMatch = matches.find((m) => m.fieldId === 'state1')!;
    expect(stateMatch.suggestedValue).toBe('Karnataka');
  });

  it('matches custom fields like Blood Group or Family Annual Income', () => {
    const fields: DetectedFormField[] = [
      {
        id: 'custom_f1',
        name: 'applicant_blood_group',
        tagName: 'input',
        type: 'text',
        label: 'Blood Group',
        placeholder: 'e.g. O+, A+',
        ariaLabel: '',
        autocomplete: '',
        surroundingText: 'Medical Emergency Information',
        selector: '#custom_f1',
        currentValue: '',
        isRequired: false,
        isDisabled: false,
      },
      {
        id: 'custom_f2',
        name: 'annual_income',
        tagName: 'input',
        type: 'text',
        label: 'Family Annual Income',
        placeholder: 'Gross family earnings',
        ariaLabel: '',
        autocomplete: '',
        surroundingText: 'Income criteria verification',
        selector: '#custom_f2',
        currentValue: '',
        isRequired: true,
        isDisabled: false,
      },
    ];

    const matches = FieldMatcher.matchFields(fields, sampleVault);
    expect(matches.length).toBe(2);
    expect(matches.find((m) => m.fieldId === 'custom_f1')?.suggestedValue).toBe('B+');
    expect(matches.find((m) => m.fieldId === 'custom_f2')?.suggestedValue).toBe('INR 4,50,000');
  });
});
