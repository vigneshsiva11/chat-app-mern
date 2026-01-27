// In-memory cache service for AI results
class CacheService {
    constructor() {
        this.cache = new Map();
        this.expiryMap = new Map();
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or null
     */
    get(key) {
        // Check if expired
        const expiry = this.expiryMap.get(key);
        if (expiry && Date.now() > expiry) {
            this.delete(key);
            return null;
        }
        return this.cache.get(key);
    }

    /**
     * Set value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds
     */
    set(key, value, ttl = null) {
        this.cache.set(key, value);
        if (ttl) {
            const expiryTime = Date.now() + ttl * 1000;
            this.expiryMap.set(key, expiryTime);
        }
    }

    /**
     * Delete key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.expiryMap.delete(key);
    }

    /**
     * Get or compute value if not in cache
     * @param {string} key - Cache key
     * @param {Function} fn - Function to compute value
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<any>} Cached or computed value
     */
    async getOrSet(key, fn, ttl = null) {
        const cached = this.get(key);
        if (cached !== null && cached !== undefined) {
            return cached;
        }
        const value = await fn();
        this.set(key, value, ttl);
        return value;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.expiryMap.clear();
    }

    /**
     * Get cache statistics
     */
    stats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

export const cacheService = new CacheService();
