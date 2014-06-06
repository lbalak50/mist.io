define('app/controllers/metric_add', ['ember'],
    //
    //  Metric Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            view: null,
            metrics: [],
            machine: null,
            callback: null,
            formReady: null,
            newMetric: null,


            //
            //
            //  Methods
            //
            //


            open: function (machine, callback) {
                this.clear();
                this.set('machine', machine)
                    .set('callback', callback);

                this.view.open();
                this.loadMetrics();
            },


            close: function () {
                this.clear();
                this.view.close();
            },


            add: function () {
                var that = this;
                Mist.metricsController.addMetric(
                    this.machine,
                    this.newMetric,
                    function (success, metric) {
                        if (success) {
                            if (that.callback)
                                that.callback(metric);
                            that.close();
                        }
                });
            },


            loadMetrics: function () {

                var url = '/backends/' + this.machine.backend.id +
                          '/machines/' + this.machine.id + '/metrics';

                var that = this;
                this.set('loadingMetrics', true);
                Mist.ajax.GET(url, {
                }).success(function(metrics) {
                    that._setMetrics(metrics);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to load metrics: ' + message);
                }).complete(function() {
                    that.set('loadingMetrics', false);
                });
            },


            clear: function () {
                this.view.clear();
                this.set('metrics', [])
                    .set('machine', null)
                    .set('callback', null)
                    .set('newMetric', {
                        'target': null,
                        'newName': null
                    });
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _setMetrics: function (metrics) {
                Ember.run(this, function () {
                    var newMetrics = [];
                    metrics.forEach(function(metric) {
                        newMetrics.push(metric);
                    });
                    this.set('metrics', newMetrics);
                    this._setMetricsTree();
                });
            },


            _setMetricsTree: function () {
                var metricsObject = this._metricsToObject();
                var metricsTree = new Node(
                    metricsObject, 'collectd', 0, '', '');
                this.set('metricsTree', metricsTree);
            },


            _metricsToObject: function () {

                var ret = new Object();
                this.metrics.forEach(function (metric) {
                    var prevParent = ret;
                    var list = metric.alias.split('.');
                    var lastIndex = list.length - 1;
                    list.forEach(function (subTarget, index) {

                        // Check if this property exists in the object already
                        if (!prevParent[subTarget]) {

                            // if this is the last node, append a
                            // string instead of an object
                            if (index == lastIndex)
                                prevParent[subTarget] = metric.alias;
                            else
                                prevParent[subTarget] = new Object();
                        }
                        prevParent = prevParent[subTarget];
                    });
                });
                return ret;
            },


            //
            //
            //  Observers
            //
            //


            newMetricObserver: function () {
                if (this.newMetric.target && this.newMetric.newName)
                    this.set('formReady', true);
                else
                    this.set('formReady', false);
            }.observes('newMetric.target', 'newMetric.newName', 'newMetric'),

        });


        function Node (dict, text, nestIndex, target, parentTarget) {

            this.text = text;
            this.nestIndex = nestIndex;
            this.isRootNode = !nestIndex;
            this.target = this.isRootNode ? '' : parentTarget + '.' + target;

            var subTargets = new Array();

            for (var key in dict) {

                // if dict[key] is an object, there are more nested targets to
                // parse. Therfore we create another Node() using dict[key].
                // Else, we pass an empty object to signify an ending node.

                var childObject = dict[key] instanceof Object ? dict[key] : {};

                subTargets.push(
                    new Node(childObject, key, nestIndex + 1, key, this.target)
                );
            }

            this.subTargets = subTargets;
            this.isEndNode = !subTargets.length;
        };
});
