import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Alert,
  Animated, // Ensure Animated is imported
  Easing,   // Easing can still be used with Animated
} from "react-native";
import {
  BarChart,
  PieChart,
  ProgressChart,
} from "react-native-chart-kit";
import { Card, Surface } from "react-native-paper";
import { fetchRoutineAnalytics } from "../../utils/api";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

// Interfaces (AnalyticsData, CompletionAnalyticsCardProps) remain the same
interface AnalyticsData {
  completion_analytics: {
    daily_completion_rates: {
      [key: string]: { completed: number; total: number; percentage: number };
    };
    activity_completion_rates: {
      [key: string]: { completed: number; total: number; percentage: number };
    };
    overall_completion_rate: {
      completed: number;
      total: number;
      percentage: number;
    };
    completion_by_activity_type: {
      task: { completed: number; total: number; percentage: number };
      hobby: { completed: number; total: number; percentage: number };
    };
  };
  time_analytics: {
    time_by_day: { [key: string]: number };
    time_by_activity: { [key: string]: number };
    time_by_type: { task: number; hobby: number };
    average_daily_time: number;
  };
  activity_frequency: {
    most_frequent_activities: { activity: string; total_hours: number }[];
    activities_by_day: {
      [key: string]: { activity: string; type: string; duration: number }[];
    };
  };
  weekly_patterns: {
    most_busy_day: string | null;
    least_busy_day: string | null;
    day_with_most_activities: string | null;
    day_with_least_activities: string | null;
  };
  time_balance: {
    task_vs_hobby_ratio: { task: number; hobby: number; ratio: number };
    work_life_balance_score: number;
  };
  consistency_score: {
    average_daily_completion: number;
    most_consistent_day: string | null;
    least_consistent_day: string | null;
  };
  routine_period: {
    start_date: string;
    end_date: string;
  };
}

interface CompletionAnalyticsCardProps {
  data: {
    activityCompletionData: Array<{
        name: string;
        percentage: number;
        legendFontColor: string;
        legendFontSize: number;
    }>;
    completion_analytics: {
      daily_completion_rates: {
        [key: string]: { completed: number; total: number; percentage: number };
      };
      overall_completion_rate: { percentage: number };
      completion_by_activity_type: {
        task: { percentage: number };
        hobby: { percentage: number };
      };
    };
  };
}


// TimeAnalyticsScreen remains largely the same as the previous corrected version
const TimeAnalyticsScreen = ({ 
  // ... props if any ...
 }) => {
  const { dark, colors } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRoutineAnalytics();
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics data.");
        Alert.alert("Error", err.message || "Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const prepareChartData = () => {
    if (!analyticsData) return null;
    const { completion_analytics } = analyticsData;
    const activityCompletionData = Object.entries(
      completion_analytics.activity_completion_rates
    ).map(([activity, data]) => ({
      name: activity.length > 15 ? activity.substring(0, 12) + "..." : activity,
      percentage: parseFloat(data.percentage.toFixed(1)),
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
    return {
      completion_analytics,
      activityCompletionData,
      // Include other data slices if needed by other components
      time_analytics: analyticsData.time_analytics,
      activity_frequency: analyticsData.activity_frequency,
      weekly_patterns: analyticsData.weekly_patterns,
      time_balance: analyticsData.time_balance,
      consistency_score: analyticsData.consistency_score,
    };
  };

  const chartData = prepareChartData();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Text style={[styles.screenTitle, { color: colors.text }]}>
        Analytics Overview
      </Text>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary || "#007AFF"} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading Analytics...
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: (colors as any).error || "#e74c3c" }]}>Error: {error}</Text>
        </View>
      )}
      {!loading && !error && chartData && chartData.completion_analytics && (
        <CompletionAnalyticsCard
          data={{
            completion_analytics: chartData.completion_analytics,
            activityCompletionData: chartData.activityCompletionData,
          }}
        />
      )}
      {!loading && !error && (!analyticsData || !chartData) && (
        <View style={styles.centered}>
          <Text style={[styles.noDataText, { color: colors.text }]}>
            Could not load analytics data or data is empty.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};


// ===================================================================================
// CompletionAnalyticsCard using Animated.View instead of MotiView for section animations
// ===================================================================================
const CompletionAnalyticsCard: React.FC<CompletionAnalyticsCardProps> = ({ data }) => {
  const { dark, colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const cardEntryAnimation = useRef(new Animated.Value(0)).current;
  const sectionAnimations = useRef(
    Array(4).fill(null).map(() => new Animated.Value(0))
  ).current;

  // Enhanced color palette (soft, pastel, modern)
  const pastelColors = [
    '#A7C7E7', // Light Blue
    '#F7CAC9', // Light Pink
    '#B5EAD7', // Light Green
    '#FFFACD', // Lemon
    '#FFDAC1', // Peach
    '#E2F0CB', // Mint
    '#CBAACB', // Lavender
    '#FFB7B2', // Coral
    '#B5D8FA', // Sky
    '#F3EAC2', // Cream
  ];
  const chartColors = {
    primary: dark ? '#B5A1FF' : '#A7C7E7',
    secondary: dark ? '#FFD6E0' : '#F7CAC9',
    success: dark ? '#B5EAD7' : '#B5EAD7',
    warning: dark ? '#FFFACD' : '#FFFACD',
    error: dark ? '#FFB7B2' : '#FFB7B2',
    background: dark ? '#181A20' : '#F8F9FB',
    surface: dark ? '#23262F' : '#FFFFFF',
    text: dark ? '#FFFFFF' : '#23262F',
    border: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
    shadow: dark ? '#00000055' : '#A7C7E755',
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardEntryAnimation, {
        toValue: 1,
        duration: 800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      ...sectionAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const baseChartConfig = {
    backgroundGradientFrom: chartColors.surface,
    backgroundGradientTo: chartColors.surface,
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 0,
    color: (opacity = 1, index = 0) => pastelColors[index % pastelColors.length],
    labelColor: (opacity = 1) => chartColors.text,
    style: { borderRadius: 20 },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: chartColors.primary,
    },
    propsForLabels: {
      fontSize: 13,
      fontWeight: '400',
      fill: chartColors.text,
    },
    propsForBackgroundLines: {
      strokeDasharray: "4",
      stroke: chartColors.border,
      strokeWidth: 1,
    },
  };

  const ensureAllDays = (dailyData: { [key: string]: { completed: number; total: number; percentage: number } }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const resultData = { ...dailyData };
    days.forEach(day => {
      if (!resultData[day]) {
        resultData[day] = { completed: 0, total: 0, percentage: 0 };
      }
    });
    return resultData;
  };
  
  const sortedDailyCompletionRates = Object.entries(ensureAllDays(data.completion_analytics.daily_completion_rates))
    .sort(([dayA], [dayB]) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB);
    });

  const dailyCompletionChartData = {
    labels: sortedDailyCompletionRates.map(([day]) => day.substring(0, 3)),
    datasets: [{
      data: sortedDailyCompletionRates.map(([, dayData]) => parseFloat(dayData.percentage.toFixed(1))),
      colors: sortedDailyCompletionRates.map((_, i) => () => pastelColors[i % pastelColors.length]),
    }],
  };

  const activityCompletionPieData = data.activityCompletionData.map((item, index) => ({
    ...item,
    percentage: item.percentage,
    color: pastelColors[index % pastelColors.length],
    legendFontColor: chartColors.text,
    legendFontSize: 13,
  }));

  const completionByTypePieData = [
    {
      name: "Tasks",
      percentage: parseFloat(data.completion_analytics.completion_by_activity_type.task.percentage.toFixed(1)),
      color: pastelColors[0],
      legendFontColor: chartColors.text,
      legendFontSize: 13,
    },
    {
      name: "Hobbies",
      percentage: parseFloat(data.completion_analytics.completion_by_activity_type.hobby.percentage.toFixed(1)),
      color: pastelColors[1],
      legendFontColor: chartColors.text,
      legendFontSize: 13,
    },
  ].filter(item => item.percentage > 0);

  const overallCompletionPercentage = parseFloat(data.completion_analytics.overall_completion_rate.percentage.toFixed(1));

  const getProgressColor = (percentage: number, opacity = 1) => {
    if (percentage < 30) return `rgba(231, 76, 60, ${opacity})`;
    if (percentage < 70) return `rgba(241, 196, 15, ${opacity})`;
    return `rgba(46, 204, 113, ${opacity})`;
  };

  const renderChartSection = (title: string, chartComponent: React.ReactNode, sectionIndex: number) => {
    const animationStyle = {
      opacity: sectionAnimations[sectionIndex],
      transform: [
        {
          translateY: sectionAnimations[sectionIndex].interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
      ],
    };

    return (
      <Animated.View style={[styles.chartSectionContainer, animationStyle]}>
        <Surface style={[styles.chartSectionSurface, {
          backgroundColor: chartColors.surface,
          borderColor: chartColors.border,
          borderWidth: 1,
          shadowColor: chartColors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        }]}
        >
          <LinearGradient
            colors={[
              `${chartColors.primary}22`,
              `${chartColors.primary}05`,
            ]}
            style={styles.chartBackgroundGradient}
          >
            <Text style={[styles.sectionTitleNew, { color: chartColors.text, borderBottomColor: chartColors.border }]}> 
              {title}
            </Text>
            <View style={styles.chartContent}>{chartComponent}</View>
          </LinearGradient>
        </Surface>
      </Animated.View>
    );
  };

  const barChartHorizontalPadding = 24;
  const chartAvailableWidth = screenWidth - 48 - barChartHorizontalPadding - 32 - 24;

  return (
    <Animated.View style={[styles.enhancedCardNew, {
      backgroundColor: chartColors.background,
      borderColor: chartColors.border,
      borderWidth: 1,
      shadowColor: chartColors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.13,
      shadowRadius: 24,
      elevation: 12,
    }, {
      opacity: cardEntryAnimation,
      transform: [
        {
          translateY: cardEntryAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
        {
          scale: cardEntryAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
    }]}
    >
      <Card.Title
        title="Completion Insights"
        titleStyle={[styles.cardTitleNew, { color: chartColors.text, fontSize: 26, fontWeight: '800', letterSpacing: 0.2 }]}
        subtitle="Your activity completion overview"
        subtitleStyle={[styles.cardSubtitleNew, { color: `${chartColors.text}99`, fontWeight: '400', fontSize: 15 }]}
      />
      <Card.Content style={styles.cardContentNew}>
        {/* Modern Bar Chart for Daily Completion Rates */}
        <View style={styles.modernChartContainer}>
          <Text style={styles.modernChartTitle}>Daily Completion Rates</Text>
          <BarChart
            data={dailyCompletionChartData}
            width={chartAvailableWidth}
            height={240}
            chartConfig={{
              ...baseChartConfig,
              backgroundGradientFrom: '#f8f9fa',
              backgroundGradientTo: '#f8f9fa',
              fillShadowGradient: chartColors.primary,
              fillShadowGradientOpacity: 1,
              color: (opacity = 1) => chartColors.primary,
              labelColor: (opacity = 1) => chartColors.text,
              propsForLabels: {
                fontSize: 14,
                fontWeight: '700',
                fill: chartColors.text,
              },
              propsForBackgroundLines: {
                strokeDasharray: "4",
                stroke: chartColors.border,
                strokeWidth: 1,
              },
            }}
            yAxisLabel=""
            yAxisSuffix="%"
            verticalLabelRotation={0}
            fromZero
            showValuesOnTopOfBars
            withInnerLines={true}
            style={styles.modernBarChart}
            segments={4}
            withCustomBarColorFromData={false}
            flatColor={true}
          />
          {/* Axis labels */}
          <View style={styles.axisLabelsRow}>
            <Text style={styles.axisLabelY}>Completion %</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.axisLabelX}>Day</Text>
          </View>
        </View>
        {activityCompletionPieData.length > 0 && renderChartSection("Activity Completion", (
          <PieChart
            data={activityCompletionPieData.map((item, index) => ({
              ...item,
              color: pastelColors[index % pastelColors.length],
            }))}
            width={chartAvailableWidth}
            height={240}
            chartConfig={baseChartConfig}
            accessor="percentage"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={activityCompletionPieData.length <= 5}
            center={[chartAvailableWidth / 4, 0]}
            avoidFalseZero
            style={styles.chartStyleNew}
          />
        ), 1)}
        {renderChartSection("Overall Completion Rate", (
          <View style={styles.progressChartContainerNew}>
            <ProgressChart
              data={{data: [overallCompletionPercentage / 100]}}
              width={chartAvailableWidth}
              height={200}
              strokeWidth={24}
              radius={70}
              chartConfig={{
                ...baseChartConfig,
                color: (opacity = 1) => `rgba(167, 199, 231, ${opacity})`,
              }}
              hideLegend
              style={styles.chartStyleNew}
            />
            <View style={styles.progressTextWrapper}>
              <Text style={[styles.progressPercentageText, { color: chartColors.primary, fontSize: 38, fontWeight: '800' }]}> 
                {overallCompletionPercentage}%
              </Text>
              <Text style={[styles.progressLabelText, { color: `${chartColors.text}99`, fontWeight: '400', fontSize: 16 }]}>Overall</Text>
            </View>
          </View>
        ), 2)}
        {completionByTypePieData.length > 0 && renderChartSection("Completion by Type", (
          <PieChart
            data={completionByTypePieData.map((item, index) => ({
              ...item,
              color: pastelColors[index % pastelColors.length],
            }))}
            width={chartAvailableWidth}
            height={240}
            chartConfig={baseChartConfig}
            accessor="percentage"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
            center={[chartAvailableWidth / 4, 0]}
            avoidFalseZero
            style={styles.chartStyleNew}
          />
        ), 3)}
      </Card.Content>
    </Animated.View>
  );
};

// Styles remain the same as your last working version
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 28,
    textAlign: "center",
    letterSpacing: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    minHeight: 220,
  },
  loadingText: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 17,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 36,
    fontSize: 17,
    fontWeight: '500',
  },
  enhancedCardNew: {
    marginBottom: 32,
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: 0,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTitleNew: {
    fontSize: 26,
    fontWeight: '800',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 24,
    letterSpacing: 0.2,
  },
  cardSubtitleNew: {
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 24,
    marginBottom: 10,
  },
  cardContentNew: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  chartSectionContainer: {
    width: '100%',
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  chartSectionSurface: {
    borderRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  chartBackgroundGradient: {
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  sectionTitleNew: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    alignSelf: 'flex-start',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  chartContent: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  chartStyleNew: {
    marginVertical: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  progressChartContainerNew: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    minHeight: 240,
  },
  progressTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentageText: {
    fontSize: 38,
    fontWeight: '800',
  },
  progressLabelText: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 6,
    opacity: 0.8,
  },
  modernChartContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  modernChartTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#23262F',
    alignSelf: 'center',
  },
  modernBarChart: {
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginVertical: 0,
    alignSelf: 'center',
  },
  axisLabelsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  axisLabelX: {
    fontSize: 14,
    fontWeight: '600',
    color: '#23262F',
    alignSelf: 'flex-end',
  },
  axisLabelY: {
    fontSize: 14,
    fontWeight: '600',
    color: '#23262F',
    alignSelf: 'flex-start',
  },
});

export default TimeAnalyticsScreen;