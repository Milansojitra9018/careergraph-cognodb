import neo4j, { Driver } from 'neo4j-driver';

const globalForNeo4j = globalThis as unknown as {
  neo4jDriver: Driver | undefined;
};

/**
 * Retrieves the singleton instance of the Neo4j driver.
 * Uses globalThis in development to prevent hot-reloading from spawning multiple connections.
 */
export function getDriver(): Driver {
  const uri = process.env.COGNODB_URI;
  const username = process.env.COGNODB_USERNAME || 'cognodb';
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    throw new Error('DATABASE_CONFIG_MISSING');
  }

  if (globalForNeo4j.neo4jDriver) {
    return globalForNeo4j.neo4jDriver;
  }

  const driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
    {
      maxConnectionLifetime: 30 * 60 * 1000, // 30 minutes
      maxConnectionPoolSize: 20,
      connectionTimeout: 10000, // 10 seconds
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    globalForNeo4j.neo4jDriver = driver;
  }

  return driver;
}

/**
 * Utility function to convert Neo4j types (like Neo4j Integer) into plain JavaScript types.
 */
export function convertNeo4jTypes(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle Neo4j Integer objects (from neo4j-driver/lib/integer.js)
  if (typeof value === 'object' && value.constructor && (value.constructor.name === 'Integer' || typeof value.low === 'number')) {
    return typeof value.toNumber === 'function' ? value.toNumber() : value.low;
  }

  // Handle Neo4j Node objects
  if (typeof value === 'object' && 'properties' in value && typeof value.properties === 'object') {
    const props = { ...value.properties };
    for (const key in props) {
      props[key] = convertNeo4jTypes(props[key]);
    }
    return props;
  }

  // Handle Neo4j Relationship objects
  if (typeof value === 'object' && 'type' in value && 'properties' in value && typeof value.properties === 'object') {
    const props = { ...value.properties };
    for (const key in props) {
      props[key] = convertNeo4jTypes(props[key]);
    }
    return {
      _type: value.type,
      ...props
    };
  }

  if (Array.isArray(value)) {
    return value.map(convertNeo4jTypes);
  }

  if (typeof value === 'object') {
    const copy = { ...value };
    for (const key in copy) {
      copy[key] = convertNeo4jTypes(copy[key]);
    }
    return copy;
  }

  return value;
}

/**
 * Runs a Cypher query using a managed session and returns formatted results.
 * @param cypher The Cypher query string
 * @param params Object containing key-value parameters for the query
 */
export async function runQuery<T = any>(
  cypher: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  let driver: Driver;
  try {
    driver = getDriver();
  } catch (err: any) {
    if (err.message === 'DATABASE_CONFIG_MISSING') {
      throw new Error('DATABASE_CONFIG_MISSING');
    }
    throw err;
  }

  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => {
      const obj: any = {};
      record.forEach((value, key) => {
        obj[key] = convertNeo4jTypes(value);
      });
      return obj;
    });
  } catch (error: any) {
    console.error('Database query execution failure:', error);
    
    // Map specific Neo4j exceptions
    if (error.code === 'ServiceUnavailable' || error.message?.includes('Failed to connect')) {
      throw new Error('DATABASE_UNAVAILABLE');
    }
    if (error.code === 'CredentialsExpired' || error.message?.includes('Unauthorized')) {
      throw new Error('DATABASE_UNAUTHORIZED');
    }
    
    throw new Error('DATABASE_QUERY_ERROR');
  } finally {
    await session.close();
  }
}
