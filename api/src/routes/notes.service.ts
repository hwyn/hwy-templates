import { Injectable } from '@hwy-fm/di';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

@Injectable()
export class NoteService {
  private notes: Note[] = [
    { id: '1', title: 'Welcome to Kernel', content: 'A microkernel architecture for TypeScript applications', createdAt: '2026-01-01' },
    { id: '2', title: 'Seed & Instruction', content: 'Seeds handle routes, Instructions cross-cut concerns', createdAt: '2026-01-02' },
    { id: '3', title: 'STD Slots Pipeline', content: 'Catch → Receive → Guard → Process → Deliver → Trace', createdAt: '2026-01-03' },
  ];

  findAll(): Note[] {
    return this.notes;
  }

  findById(id: string): Note {
    if (!id) throw { status: 400, message: 'Missing note id' };
    const note = this.notes.find(n => n.id === id);
    if (!note) throw { status: 404, message: `Note '${id}' not found` };
    return note;
  }

  create(data: { title: string; content?: string }): Note {
    if (!data.title) throw { status: 400, message: 'Missing required field: title' };
    const note: Note = {
      id: String(Date.now()),
      title: data.title,
      content: data.content ?? '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.notes.push(note);
    return note;
  }
}
