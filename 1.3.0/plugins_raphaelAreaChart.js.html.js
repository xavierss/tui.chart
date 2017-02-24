ne.util.defineNamespace("fedoc.content", {});
fedoc.content["plugins_raphaelAreaChart.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Raphael area chart renderer.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar RaphaelLineBase = require('./raphaelLineTypeBase'),\n    raphaelRenderUtil = require('./raphaelRenderUtil');\n\nvar Raphael = window.Raphael,\n    ANIMATION_TIME = 700;\n\nvar concat = Array.prototype.concat;\n\n/**\n * @classdesc RaphaelAreaChart is graph renderer for area chart.\n * @class RaphaelAreaChart\n * @extends RaphaelLineTypeBase\n */\nvar RaphaelAreaChart = tui.util.defineClass(RaphaelLineBase, /** @lends RaphaelAreaChart.prototype */ {\n    /**\n     * Render function of area chart.\n     * @param {HTMLElement} container container\n     * @param {{groupPositions: array.&lt;array>, dimension: object, theme: object, options: object}} data render data\n     * @return {object} paper raphael paper\n     */\n    render: function(container, data) {\n        var dimension = data.dimension,\n            groupPositions = data.groupPositions,\n            theme = data.theme,\n            colors = theme.colors,\n            opacity = data.options.hasDot ? 1 : 0,\n            groupPaths = this._getAreasPath(groupPositions, data.zeroTop),\n            borderStyle = this.makeBorderStyle(theme.borderColor, opacity),\n            outDotStyle = this.makeOutDotStyle(opacity, borderStyle),\n            paper, groupAreas, tooltipLine, selectionDot, groupDots;\n\n        this.paper = paper = Raphael(container, dimension.width, dimension.height);\n\n        groupAreas = this._renderAreas(paper, groupPaths, colors);\n        tooltipLine = this._renderTooltipLine(paper, dimension.height);\n        selectionDot = this._makeSelectionDot(paper);\n        groupDots = this._renderDots(paper, groupPositions, colors, borderStyle);\n\n        if (data.options.hasSelection) {\n            this.selectionDot = selectionDot;\n            this.selectionColor = theme.selectionColor;\n        }\n\n        this.outDotStyle = outDotStyle;\n        this.groupPositions = groupPositions;\n        this.groupPaths = groupPaths;\n        this.groupAreas = groupAreas;\n        this.tooltipLine = tooltipLine;\n        this.groupDots = groupDots;\n        this.dotOpacity = opacity;\n\n        return paper;\n    },\n\n    /**\n     * Render area graph.\n     * @param {object} paper paper\n     * @param {{start: string, addStart: string}} path path\n     * @param {string} color color\n     * @returns {array.&lt;object>} raphael object\n     * @private\n     */\n    _renderArea: function(paper, path, color) {\n        var result = [],\n            area = paper.path([path.start]),\n            fillStyle = {\n                fill: color,\n                opacity: 0.5,\n                stroke: color,\n                'stroke-opacity': 0\n            },\n            addArea;\n\n        area.attr(fillStyle);\n        result.push(area);\n\n        if (path.addStart) {\n            addArea = paper.path([path.addStart]);\n            addArea.attr(fillStyle);\n            result.push(addArea);\n        }\n        return result;\n    },\n\n    /**\n     * Render area graphs.\n     * @param {object} paper paper\n     * @param {array.&lt;object>} groupPaths group paths\n     * @param {array.&lt;string>} colors colors\n     * @returns {array} raphael objects\n     * @private\n     */\n    _renderAreas: function(paper, groupPaths, colors) {\n        var groupAreas = tui.util.map(groupPaths, function(paths, groupIndex) {\n            var color = colors[groupIndex] || 'transparent';\n            return tui.util.map(paths, function(path) {\n                var result = {\n                    area: this._renderArea(paper, path.area, color),\n                    line: raphaelRenderUtil.renderLine(paper, path.line.start, color)\n                };\n                return result;\n            }, this);\n        }, this);\n\n        return groupAreas;\n    },\n\n    /**\n     * Whether minus or not.\n     * @param {number} value value\n     * @returns {boolean} result boolean\n     * @private\n     */\n    _isMinus: function(value) {\n        return value &lt; 0;\n    },\n\n    /**\n     * Whether plus or not.\n     * @param {number} value value\n     * @returns {boolean} result boolean\n     * @private\n     */\n    _isPlus: function(value) {\n        return value >= 0;\n    },\n\n    /**\n     * To make height.\n     * @param {number} top top\n     * @param {number} zeroTop zero position top\n     * @returns {number} height\n     * @private\n     */\n    _makeHeight: function(top, zeroTop) {\n        return Math.abs(top - zeroTop);\n    },\n\n    /**\n     * Find middle left\n     * @param {{left: number, top: number}} fromPos from position\n     * @param {{left: number, top: number}} toPos to position\n     * @param {number} zeroTop zero position top\n     * @returns {number} middle left\n     * @private\n     */\n    _findMiddleLeft: function(fromPos, toPos, zeroTop) {\n        var tops = [zeroTop - fromPos.top, zeroTop - toPos.top],\n            middleLeft, width, fromHeight, toHeight;\n\n        if (tui.util.all(tops, this._isMinus) || tui.util.all(tops, this._isPlus)) {\n            return -1;\n        }\n\n        fromHeight = this._makeHeight(fromPos.top, zeroTop);\n        toHeight = this._makeHeight(toPos.top, zeroTop);\n        width = toPos.left - fromPos.left;\n\n        middleLeft = fromPos.left + (width * (fromHeight / (fromHeight + toHeight)));\n        return middleLeft;\n    },\n\n    /**\n     * To make area path.\n     * @param {{left: number, top: number}} fromPos from position\n     * @param {{left: number, top: number}} toPos to position\n     * @param {number} zeroTop zero position top\n     * @returns {string} area path\n     * @private\n     */\n    _makeAreaPath: function(fromPos, toPos, zeroTop) {\n        var fromStartPoint = ['M', fromPos.left, ' ', zeroTop],\n            fromEndPoint = zeroTop === fromPos.top ? [] : ['L', fromPos.left, ' ', fromPos.top],\n            toStartPoint = ['L', toPos.left, ' ', toPos.top],\n            toEndPoint = zeroTop === toPos.top ? [] : ['L', toPos.left, ' ', zeroTop];\n        return concat.call([], fromStartPoint, fromEndPoint, toStartPoint, toEndPoint).join('');\n    },\n\n    /**\n     * To make area paths.\n     * @param {{left: number, top: number}} fromPos from position\n     * @param {{left: number, top: number}} toPos to position\n     * @param {number} zeroTop zero position top\n     * @returns {{\n     *      start: string,\n     *      end: string,\n     *      addStart: string,\n     *      addEnd: string\n     * }} area paths\n     * @private\n     */\n    _makeAreaPaths: function(fromPos, toPos, zeroTop) {\n        var middleLeft = this._findMiddleLeft(fromPos, toPos, zeroTop),\n            result = {\n                start: this._makeAreaPath(fromPos, fromPos, zeroTop)\n            },\n            middlePos;\n\n        if (this._isPlus(middleLeft)) {\n            middlePos = {left: middleLeft, top: zeroTop};\n            result.end = this._makeAreaPath(fromPos, middlePos, zeroTop);\n            result.addStart = this._makeAreaPath(middlePos, middlePos, zeroTop);\n            result.addEnd = this._makeAreaPath(middlePos, toPos, zeroTop);\n        } else {\n            result.end = this._makeAreaPath(fromPos, toPos, zeroTop);\n        }\n\n        return result;\n    },\n\n    /**\n     * Get area path.\n     * @param {array.&lt;array.&lt;object>>} groupPositions positions\n     * @param {number} zeroTop zero top\n     * @returns {array.&lt;array.&lt;string>>} paths\n     * @private\n     */\n    _getAreasPath: function(groupPositions, zeroTop) {\n        var groupPaths = tui.util.map(groupPositions, function(positions) {\n            var fromPos = positions[0],\n                rest = positions.slice(1);\n            return tui.util.map(rest, function(position) {\n                var result = {\n                    area: this._makeAreaPaths(fromPos, position, zeroTop),\n                    line: this.makeLinePath(fromPos, position)\n                };\n                fromPos = position;\n                return result;\n            }, this);\n        }, this);\n        return groupPaths;\n    },\n\n    /**\n     * Animate area chart.\n     * @param {object} area raphael object\n     * @param {string} areaPath path\n     * @param {number} time play time\n     * @param {number} startTime start time\n     * @private\n     */\n    _animateArea: function(area, areaPath, time, startTime) {\n        var areaAddEndPath = areaPath.addEnd,\n            areaEndPath = areaPath.end;\n        if (areaAddEndPath) {\n            time = time / 2;\n            setTimeout(function() {\n                area[1].animate({path: areaAddEndPath, 'stroke-opacity': 0.25}, time);\n            }, startTime + time);\n        }\n        setTimeout(function() {\n            area[0].animate({path: areaEndPath, 'stroke-opacity': 0.25}, time);\n        }, startTime);\n    },\n\n    /**\n     * Animate.\n     * @param {function} callback callback\n     */\n    animate: function(callback) {\n        var time = ANIMATION_TIME / this.groupAreas[0].length,\n            that = this,\n            startTime = 0;\n\n        this.renderItems(function(dot, groupIndex, index) {\n            var area, areaPath;\n            if (index) {\n                area = that.groupAreas[groupIndex][index - 1];\n                areaPath = that.groupPaths[groupIndex][index - 1];\n                that.animateLine(area.line, areaPath.line.end, time, startTime);\n                that._animateArea(area.area, areaPath.area, time, startTime);\n                startTime += time;\n            } else {\n                startTime = 0;\n            }\n\n            if (that.dotOpacity) {\n                setTimeout(function() {\n                    dot.attr({'fill-opacity': that.dotOpacity});\n                }, startTime);\n            }\n        });\n\n        if (callback) {\n            setTimeout(callback, startTime);\n        }\n    },\n\n    /**\n     * To update area attribute\n     * @param {object} area raphael object\n     * @param {string} areaPath area path\n     * @private\n     */\n    _updateAreaAttr: function(area, areaPath) {\n        var areaAddEndPath = areaPath.addEnd;\n        area[0].attr({path: areaPath.end});\n        if (areaAddEndPath) {\n            area[1].attr({path: areaAddEndPath});\n        }\n    },\n\n    /**\n     * To resize graph of area chart.\n     * @param {object} params parameters\n     *      @param {{width: number, height:number}} params.dimension dimension\n     *      @param {array.&lt;array.&lt;{left:number, top:number}>>} params.groupPositions group positions\n     */\n    resize: function(params) {\n        var dimension = params.dimension,\n            groupPositions = params.groupPositions,\n            that = this;\n\n        this.groupPositions = groupPositions;\n        this.groupPaths = this._getAreasPath(groupPositions, params.zeroTop);\n        this.paper.setSize(dimension.width, dimension.height);\n        this.tooltipLine.attr({top: dimension.height});\n\n        this.renderItems(function(dot, groupIndex, index) {\n            var position = groupPositions[groupIndex][index],\n                dotAttrs = {\n                    cx: position.left,\n                    cy: position.top\n                },\n                area, areaPath;\n            if (index) {\n                area = that.groupAreas[groupIndex][index - 1];\n                areaPath = that.groupPaths[groupIndex][index - 1];\n                area.line.attr({path: areaPath.line.end});\n                that._updateAreaAttr(area.area, areaPath.area);\n            }\n\n            if (that.dotOpacity) {\n                dotAttrs = tui.util.extend({'fill-opacity': that.dotOpacity}, dotAttrs, that.borderStyle);\n            }\n\n            dot.attr(dotAttrs);\n        });\n    }\n});\n\nmodule.exports = RaphaelAreaChart;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"