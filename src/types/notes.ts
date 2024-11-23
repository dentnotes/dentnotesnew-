export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    type: 'clinic' | 'diagnostic' | 'preventive' | 'periodontics' | 'oral-surgery' | 'endodontics' | 'restorative' | 'prosthodontics-fixed' | 'prosthodontics-removable' | 'other-services';
    created_at: string;
    updated_at: string;
  }
  
  export type NewNote = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
  