// Підключаємо лише потрібні віджети jQuery UI: Accordion, Autocomplete, Datepicker.
// Модулі jQuery UI розраховані на глобальний jQuery, тому порядок імпортів важливий:
// спочатку jQuery, потім ядро (version, widget, …), потім віджети.
import $ from './jquery.js';
import 'jquery-ui/ui/version.js';
import 'jquery-ui/ui/widget.js';
import 'jquery-ui/ui/keycode.js';
import 'jquery-ui/ui/unique-id.js';
import 'jquery-ui/ui/position.js';
import 'jquery-ui/ui/widgets/menu.js';
import 'jquery-ui/ui/widgets/accordion.js';
import 'jquery-ui/ui/widgets/autocomplete.js';
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-uk.js';

import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/accordion.css';
import 'jquery-ui/themes/base/menu.css';
import 'jquery-ui/themes/base/autocomplete.css';
import 'jquery-ui/themes/base/datepicker.css';
import 'jquery-ui/themes/base/theme.css';

export default $;
