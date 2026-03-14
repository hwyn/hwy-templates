import { Inject, Injectable } from '@hwy-fm/di';
import { JsonFileStorage } from '@hwy-fm/platform';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const DEFAULT_NOTES: Note[] = [
  { id: '1', title: 'Welcome to Kernel', content: 'A microkernel architecture for TypeScript applications', createdAt: '2026-01-01' },
  { id: '2', title: 'Seed & Instruction', content: 'Seeds handle routes, Instructions cross-cut concerns', createdAt: '2026-01-02' },
  { id: '3', title: 'STD Slots Pipeline', content: 'Catch → Receive → Guard → Check → Process → Deliver → Trace', createdAt: '2026-01-03' },
];

@Injectable()
export class NoteService {
  constructor(@Inject(JsonFileStorage) private storage: JsonFileStorage) { }

  findAll(): Note[] {
    return this.storage.load('notes', DEFAULT_NOTES);
  }

  findById(id: string): Note {
    if (!id) throw { status: 400, message: 'Missing note id' };
    const note = this.storage.load<Note[]>('notes', DEFAULT_NOTES).find(n => n.id === id);
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
    const notes = this.storage.load<Note[]>('notes', DEFAULT_NOTES);
    notes.push(note);
    this.storage.save('notes', notes);
    return note;
  }
}
