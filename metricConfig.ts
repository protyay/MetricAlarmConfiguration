export type MetricInfo = {
  metricName: string;
  metricUnit: Unit;
  metricStats: MetricStatistic;
  alarmFriendlyName: string;
  alarmConfig?: {
    [Severity.SEV2]?: {
      threshold: number;
      comparisonOperator: ComparisonOperator;
      treatMissingDataOverride: TreatMissingData;
    };
    // Sev3 is marked as mandatory.
    [Severity.SEV3]: {
      threshold: number;
      comparisonOperator: ComparisonOperator;
      treatMissingDataOverride: TreatMissingData;
    };
  };
};

function buildMetricAndAlarm(applicableMetrics: MetricInfo[]): CustomMetric[] {
  const metrics: CustomMetric[] = [];
  applicableMetrics.forEach((applicationMetric) => {
    const metric = new Metric({
      namespace: YOUR_SERVICE_NAME,
      metricName: applicationMetric.metricName,
      unit: applicationMetric.metricUnit,
      statistic: applicationMetric.metricStats,
      dimensionsMap: {
        Operation: YOUR_OPERATION_NAME,
      },
    });

    const metricItem = {
      metric,
      alarmFriendlyName: applicationMetric.alarmFriendlyName,
      addAlarm: {},
    };
    
    if (applicationMetric.alarmConfig && applicationMetric.alarmConfig[Severity.SEV3]) {
      metricItem.addAlarm = {
        Warning: applicationMetric.alarmConfig[Severity.SEV3],
      };
    }

    if (applicationMetric.alarmConfig && applicationMetric.alarmConfig[Severity.SEV2]) {
      metricItem.addAlarm = {
        ...metricItem.addAlarm,
        Critical: applicationMetric.alarmConfig[Severity.SEV2],
      };
    }

    metrics.push(metricItem);
  });
  return metrics;
}

/**
 * Helper function to build the metric group
 * that will be rendered as a single widget in the dashboard.
 * @param system the system object from the enum
 */
export function buildMetricGroup(system: DownstreamSystems): CustomMetricGroup[] {
  const metricGroup: CustomMetricGroup[] = [];
  const applicableMetrics = dependentSystemsMetrics[system];
  const metricWithAlarms = buildMetricAndAlarm(applicableMetrics);
  metricGroup.push({
    metrics: metricWithAlarms,
    title: `${system}-Metrics`,
    graphWidgetType: GraphWidgetType.LINE,
    graphWidgetAxis: {
      label: `${system}-Metrics`,
    },
  });
  return metricGroup;
}
