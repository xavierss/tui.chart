ne.util.defineNamespace("fedoc.content", {});
fedoc.content["legends_legendTemplate.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview This is templates of legend view.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\nvar templateMaker = require('../helpers/templateMaker');\n\nvar tags = {\n    HTML_LEGEND: '&lt;div class=\"tui-chart-legend\">' +\n        '&lt;div class=\"tui-chart-legend-rect {{ chartType }}\" style=\"{{ cssText }}\">&lt;/div>' +\n        '&lt;div class=\"tui-chart-legend-label\" style=\"height:{{ height }}px\">{{ label }}&lt;/div>&lt;/div>'\n};\n\nmodule.exports = {\n    tplLegend: templateMaker.template(tags.HTML_LEGEND)\n};\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"