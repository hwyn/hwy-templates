import { PageRegistry } from '../shared/page-registry';

import HomePage from './pages/HomePage.vue';
import NoteList from './pages/NoteList.vue';
import NoteDetail from './pages/NoteDetail.vue';
import DebugPage from './pages/DebugPage.vue';
import PlaygroundPage from './pages/PlaygroundPage.vue';
import ErrorPage from './pages/ErrorPage.vue';
import PageLayout from './components/PageLayout.vue';

PageRegistry.register('/', HomePage);
PageRegistry.register('notes', NoteList, { title: 'Notes', backLink: '/' });
PageRegistry.register('notes/:id', NoteDetail, { backLinks: [{ href: '/notes', label: 'Notes' }] });
PageRegistry.register('_debug', DebugPage, { title: '🛠 Debug Inspector', backLink: '/' });
PageRegistry.register('_playground', PlaygroundPage, undefined, null);
PageRegistry.register('_error', ErrorPage, undefined, null);

PageRegistry.error('_error');
PageRegistry.layout(PageLayout);
