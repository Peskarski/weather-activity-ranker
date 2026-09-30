import type { GraphQLResolveInfo } from 'graphql';
import type { Place as PlaceModel } from '../openMeteo/index.ts';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Activity =
  | 'INDOOR_SIGHTSEEING'
  | 'OUTDOOR_SIGHTSEEING'
  | 'SKIING'
  | 'SURFING';

export type ActivityForecast = {
  __typename?: 'ActivityForecast';
  activities: Array<ActivityRanking>;
  place: Place;
};

export type ActivityRanking = {
  __typename?: 'ActivityRanking';
  activity: Activity;
  available: Scalars['Boolean']['output'];
  /** ISO date of the highest-scoring day. */
  bestDay?: Maybe<Scalars['String']['output']>;
  days: Array<DayScore>;
  /** Why no day this week is possible. Null when available. */
  unavailableReason?: Maybe<ReasonCode>;
  /** Distance from the place to the sea grid cell the wave forecast comes from. Surfing only. */
  waveForecastDistanceKm?: Maybe<Scalars['Float']['output']>;
  weekLabel: ScoreLabel;
  /** Mean of the 3 best daily scores, 0-100. Null when unavailable. */
  weekScore?: Maybe<Scalars['Int']['output']>;
};

export type DayScore = {
  __typename?: 'DayScore';
  /** ISO date, local to the place. */
  date: Scalars['String']['output'];
  label: ScoreLabel;
  /** Up to 3, most important first. */
  reasons: Array<Reason>;
  /** 0-100 */
  score: Scalars['Int']['output'];
};

export type Impact =
  | 'NEGATIVE'
  | 'POSITIVE';

export type Place = {
  __typename?: 'Place';
  country?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<Scalars['String']['output']>;
  elevation?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  /** First-level administrative area, e.g. state or region. */
  region?: Maybe<Scalars['String']['output']>;
  /** IANA time zone; forecast dates are local to it. */
  timezone: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /**
   * How good the next 7 days are for each activity at a place, best activity first.
   * Errors: BAD_USER_INPUT, PLACE_NOT_FOUND, UPSTREAM_UNAVAILABLE (extensions.code).
   */
  activityForecast: ActivityForecast;
  /** Places matching a name, for autocomplete. Returns an empty list for queries shorter than 2 characters. */
  searchPlaces: Array<Place>;
};


export type QueryActivityForecastArgs = {
  placeId: Scalars['ID']['input'];
};


export type QuerySearchPlacesArgs = {
  query: Scalars['String']['input'];
};

export type Reason = {
  __typename?: 'Reason';
  code: ReasonCode;
  impact: Impact;
  /** Measurement behind the reason, in the unit listed on its code. Null when the code has none. */
  value?: Maybe<Scalars['Float']['output']>;
};

export type ReasonCode =
  /** Outdoor sightseeing score, 0-100 */
  | 'BAD_WEATHER_OUTSIDE'
  /** Max apparent temperature, °C */
  | 'FEELS_LIKE'
  /** Wave height, m */
  | 'FLAT'
  /** Snowfall over today and yesterday, cm */
  | 'FRESH_SNOW'
  /** Outdoor sightseeing score, 0-100 */
  | 'GOOD_WEATHER_OUTSIDE'
  /** Wind gusts, km/h */
  | 'GUSTS'
  /** Precipitation, mm */
  | 'HEAVY_RAIN'
  /** Snowfall, cm */
  | 'HEAVY_SNOW'
  /** Wind gusts, km/h */
  | 'LIFTS_CLOSED'
  | 'MARINE_UNAVAILABLE'
  | 'NO_COAST'
  /** Snow depth, m */
  | 'NO_SNOW'
  | 'NO_WAVE_DATA'
  /** Precipitation, mm */
  | 'PRECIPITATION'
  /** Max precipitation probability, % */
  | 'PRECIPITATION_PROBABILITY'
  /** Max temperature, °C */
  | 'SLUSH'
  /** Snow depth, m */
  | 'SNOW_DEPTH'
  /** Wind gusts, km/h */
  | 'STRONG_GUSTS'
  /** Share of daylight with sunshine, 0-1 */
  | 'SUNSHINE'
  /** Max swell period, s */
  | 'SWELL_PERIOD'
  /** Max temperature, °C */
  | 'TEMPERATURE'
  | 'THUNDERSTORM'
  /** Wave height, m */
  | 'TOO_BIG'
  /** Mean daytime visibility, km */
  | 'VISIBILITY'
  /** Max wave height, m */
  | 'WAVE_HEIGHT'
  /** Max wind speed, km/h */
  | 'WIND';

export type ScoreLabel =
  | 'FAIR'
  | 'GOOD'
  | 'GREAT'
  | 'NOT_POSSIBLE'
  | 'POOR';



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Activity: Activity;
  ActivityForecast: ResolverTypeWrapper<Omit<ActivityForecast, 'place'> & { place: ResolversTypes['Place'] }>;
  ActivityRanking: ResolverTypeWrapper<ActivityRanking>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DayScore: ResolverTypeWrapper<DayScore>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Impact: Impact;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Place: ResolverTypeWrapper<PlaceModel>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Reason: ResolverTypeWrapper<Reason>;
  ReasonCode: ReasonCode;
  ScoreLabel: ScoreLabel;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActivityForecast: Omit<ActivityForecast, 'place'> & { place: ResolversParentTypes['Place'] };
  ActivityRanking: ActivityRanking;
  Boolean: Scalars['Boolean']['output'];
  DayScore: DayScore;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Place: PlaceModel;
  Query: Record<PropertyKey, never>;
  Reason: Reason;
  String: Scalars['String']['output'];
};

export type ActivityForecastResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityForecast'] = ResolversParentTypes['ActivityForecast']> = {
  activities?: Resolver<Array<ResolversTypes['ActivityRanking']>, ParentType, ContextType>;
  place?: Resolver<ResolversTypes['Place'], ParentType, ContextType>;
};

export type ActivityRankingResolvers<ContextType = any, ParentType extends ResolversParentTypes['ActivityRanking'] = ResolversParentTypes['ActivityRanking']> = {
  activity?: Resolver<ResolversTypes['Activity'], ParentType, ContextType>;
  available?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bestDay?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  days?: Resolver<Array<ResolversTypes['DayScore']>, ParentType, ContextType>;
  unavailableReason?: Resolver<Maybe<ResolversTypes['ReasonCode']>, ParentType, ContextType>;
  waveForecastDistanceKm?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weekLabel?: Resolver<ResolversTypes['ScoreLabel'], ParentType, ContextType>;
  weekScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type DayScoreResolvers<ContextType = any, ParentType extends ResolversParentTypes['DayScore'] = ResolversParentTypes['DayScore']> = {
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['ScoreLabel'], ParentType, ContextType>;
  reasons?: Resolver<Array<ResolversTypes['Reason']>, ParentType, ContextType>;
  score?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type PlaceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Place'] = ResolversParentTypes['Place']> = {
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  elevation?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activityForecast?: Resolver<ResolversTypes['ActivityForecast'], ParentType, ContextType, RequireFields<QueryActivityForecastArgs, 'placeId'>>;
  searchPlaces?: Resolver<Array<ResolversTypes['Place']>, ParentType, ContextType, RequireFields<QuerySearchPlacesArgs, 'query'>>;
};

export type ReasonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Reason'] = ResolversParentTypes['Reason']> = {
  code?: Resolver<ResolversTypes['ReasonCode'], ParentType, ContextType>;
  impact?: Resolver<ResolversTypes['Impact'], ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  ActivityForecast?: ActivityForecastResolvers<ContextType>;
  ActivityRanking?: ActivityRankingResolvers<ContextType>;
  DayScore?: DayScoreResolvers<ContextType>;
  Place?: PlaceResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reason?: ReasonResolvers<ContextType>;
};

