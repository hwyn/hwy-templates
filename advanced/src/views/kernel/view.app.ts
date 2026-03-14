/**
 * ViewKernel bootstrap — view seeds + bridge.
 */
import './view.bridge';
import '../pipelines/home.view-seed';
import '../pipelines/note-list.view-seed';
import '../pipelines/note-detail.view-seed';
import '../pipelines/debug.view-seed';
import '../pipelines/playground.view-seed';
import '../pipelines/error.view-seed';
import '../pipelines/error.fallback';

import { ViewKernel } from './view.model';

@ViewKernel.bootstrap()
export class ViewApp { }
