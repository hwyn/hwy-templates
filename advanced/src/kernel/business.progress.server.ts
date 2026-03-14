import './business.bridge';
import '../pipelines/auth';
import '../pipelines/home';
import '../pipelines/notes';
import '../pipelines/debug';
import '../pipelines/playground';

import { BusinessKernel } from './business.model';

@BusinessKernel.bootstrap()
export class BusinessApp { }
