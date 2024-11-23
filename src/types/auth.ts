export interface UserMetadata {
    name: string
    university: string
    year: string
    program: string
  }
  
  export interface SignUpData {
    action: 'sign-up'
    email: string
    password: string
    metadata: UserMetadata
  }
  
  export interface SignInData {
    action: 'sign-in'
    email: string
    password: string
  }
  