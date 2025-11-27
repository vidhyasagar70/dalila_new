declare module 'react-phone-input-2' {
  import * as React from 'react';
  export interface CountryData {
    name: string;
    dialCode: string;
    countryCode: string;
    format?: string;
  }
  interface PhoneInputProps {
    country?: string;
    value?: string;
    onChange?: (value: string, data: CountryData, event: React.ChangeEvent<HTMLInputElement>, formattedValue: string) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    inputClass?: string;
    buttonClass?: string;
    dropdownClass?: string;
    containerClass?: string;
    enableSearch?: boolean;
    disableSearchIcon?: boolean;
    specialLabel?: string;
    countryCodeEditable?: boolean;
    enableAreaCodes?: boolean;
    masks?: Record<string, string>;
    [key: string]: any;
  }
  const PhoneInput: React.FC<PhoneInputProps>;
  export default PhoneInput;
}