import type { Express, Request } from "express";
import { isAuthenticated } from "./replitAuth";

// Security service integrations
interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'brute_force' | 'geographic_anomaly' | 'device_anomaly' | 'session_hijack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  ipAddress: string;
  location: string;
  details: Record<string, any>;
  action: 'logged' | 'blocked' | 'quarantined';
}

interface ThreatIntelligence {
  ipAddress: string;
  reputation: 'clean' | 'suspicious' | 'malicious';
  country: string;
  isp: string;
  isVpn: boolean;
  isTor: boolean;
  threatTypes: string[];
  lastSeen: Date;
}

interface GeoLocation {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
}

// Mock external security services (in production, these would be real API calls)
class SecurityIntegrationService {
  // IP Reputation Check (simulating services like VirusTotal, AbuseIPDB)
  async checkIPReputation(ipAddress: string): Promise<ThreatIntelligence> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock threat intelligence data
    const mockData: ThreatIntelligence = {
      ipAddress,
      reputation: this.isKnownMaliciousIP(ipAddress) ? 'malicious' : 'clean',
      country: this.getCountryFromIP(ipAddress),
      isp: 'Internet Service Provider',
      isVpn: Math.random() < 0.1, // 10% chance of VPN
      isTor: Math.random() < 0.05, // 5% chance of Tor
      threatTypes: this.isKnownMaliciousIP(ipAddress) ? ['brute_force', 'malware'] : [],
      lastSeen: new Date()
    };
    
    return mockData;
  }

  // Geolocation Service (simulating MaxMind GeoIP)
  async getGeolocation(ipAddress: string): Promise<GeoLocation> {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      ip: ipAddress,
      country: this.getCountryFromIP(ipAddress),
      region: 'NY',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      isp: 'Verizon Communications'
    };
  }

  // Behavioral Analysis (simulating ML-based anomaly detection)
  async analyzeBehavior(userId: string, ipAddress: string, userAgent: string): Promise<{
    riskScore: number;
    anomalies: string[];
    recommendation: 'allow' | 'challenge' | 'block';
  }> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const anomalies: string[] = [];
    let riskScore = 0;
    
    // Check for suspicious patterns
    if (this.isKnownMaliciousIP(ipAddress)) {
      anomalies.push('Known malicious IP');
      riskScore += 50;
    }
    
    if (this.isUnusualLocation(ipAddress)) {
      anomalies.push('Unusual geographic location');
      riskScore += 25;
    }
    
    if (this.isUnusualDevice(userAgent)) {
      anomalies.push('Unusual device or browser');
      riskScore += 15;
    }
    
    const recommendation: 'allow' | 'challenge' | 'block' = 
      riskScore >= 70 ? 'block' :
      riskScore >= 40 ? 'challenge' : 'allow';
    
    return { riskScore, anomalies, recommendation };
  }

  // Device Fingerprinting
  generateDeviceFingerprint(userAgent: string, acceptLanguage: string, ip: string): string {
    const components = [
      userAgent,
      acceptLanguage,
      ip.split('.').slice(0, 3).join('.') // Partial IP for privacy
    ];
    
    // Simple hash for demonstration
    return Buffer.from(components.join('|')).toString('base64').slice(0, 16);
  }

  // Session Monitoring
  async validateSession(sessionId: string, userId: string, ipAddress: string): Promise<{
    isValid: boolean;
    risk: 'low' | 'medium' | 'high';
    reasons: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const reasons: string[] = [];
    let risk: 'low' | 'medium' | 'high' = 'low';
    
    // Check for session anomalies
    if (this.isKnownMaliciousIP(ipAddress)) {
      reasons.push('Session from malicious IP');
      risk = 'high';
    }
    
    if (Math.random() < 0.1) { // 10% chance of detecting session hijack
      reasons.push('Potential session hijacking detected');
      risk = 'high';
    }
    
    return {
      isValid: risk !== 'high',
      risk,
      reasons
    };
  }

  // Helper methods
  private isKnownMaliciousIP(ip: string): boolean {
    // Simulate known malicious IPs
    const maliciousIPs = ['203.0.113.1', '198.51.100.1', '192.0.2.1'];
    return maliciousIPs.includes(ip);
  }

  private getCountryFromIP(ip: string): string {
    // Simple IP to country mapping for demo
    if (ip.startsWith('203.0.113')) return 'RU';
    if (ip.startsWith('198.51.100')) return 'CN';
    if (ip.startsWith('192.0.2')) return 'IR';
    return 'US';
  }

  private isUnusualLocation(ip: string): boolean {
    const country = this.getCountryFromIP(ip);
    // Consider certain countries as unusual for this demo
    return ['RU', 'CN', 'IR', 'KP'].includes(country);
  }

  private isUnusualDevice(userAgent: string): boolean {
    // Flag unusual or suspicious user agents
    const suspiciousAgents = ['bot', 'crawler', 'scanner', 'python', 'curl'];
    return suspiciousAgents.some(agent => 
      userAgent.toLowerCase().includes(agent)
    );
  }
}

// Notification Service (simulating Slack, Discord, email integrations)
class NotificationService {
  async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
    console.log(`🚨 Security Alert [${alert.severity.toUpperCase()}]: ${alert.description}`);
    console.log(`IP: ${alert.ipAddress}, Location: ${alert.location}, Action: ${alert.action}`);
    
    // In production, this would send to:
    // - Slack webhook
    // - Discord webhook
    // - Email alerts
    // - SMS for critical alerts
    // - PagerDuty for critical incidents
  }

  async sendLoginNotification(userId: string, location: string, device: string): Promise<void> {
    console.log(`✅ Login notification for user ${userId} from ${location} on ${device}`);
  }
}

// Main security middleware
export class SecurityIntegrations {
  private securityService = new SecurityIntegrationService();
  private notificationService = new NotificationService();
  private alerts: SecurityAlert[] = [];

  // Enhanced request analysis middleware
  async analyzeRequest(req: Request): Promise<{
    allowed: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reasons: string[];
  }> {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    const userId = (req as any).user?.claims?.sub || 'anonymous';

    try {
      // Parallel security checks
      const [threatIntel, geolocation, behavior] = await Promise.all([
        this.securityService.checkIPReputation(ipAddress),
        this.securityService.getGeolocation(ipAddress),
        this.securityService.analyzeBehavior(userId, ipAddress, userAgent)
      ]);

      const reasons: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // Evaluate threat intelligence
      if (threatIntel.reputation === 'malicious') {
        reasons.push('Malicious IP detected');
        riskLevel = 'high';
      } else if (threatIntel.reputation === 'suspicious') {
        reasons.push('Suspicious IP detected');
        riskLevel = 'medium';
      }

      // Evaluate behavioral analysis
      if (behavior.riskScore >= 70) {
        reasons.push(`High risk behavior (score: ${behavior.riskScore})`);
        riskLevel = 'high';
      } else if (behavior.riskScore >= 40) {
        reasons.push(`Medium risk behavior (score: ${behavior.riskScore})`);
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }

      // Check for geographic anomalies
      if (threatIntel.country !== 'US' && !['CA', 'GB', 'AU'].includes(threatIntel.country)) {
        reasons.push(`Access from unusual location: ${threatIntel.country}`);
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }

      // Generate alert if high risk
      if (riskLevel === 'high') {
        const alert: SecurityAlert = {
          id: Math.random().toString(36).substring(7),
          type: 'suspicious_login',
          severity: 'high',
          timestamp: new Date(),
          description: `High-risk access attempt from ${geolocation.city}, ${geolocation.country}`,
          ipAddress,
          location: `${geolocation.city}, ${geolocation.country}`,
          details: {
            threatIntel,
            behavior,
            userAgent
          },
          action: 'blocked'
        };

        this.alerts.push(alert);
        await this.notificationService.sendSecurityAlert(alert);
      }

      return {
        allowed: riskLevel !== 'high',
        riskLevel,
        reasons
      };
    } catch (error) {
      console.error('Security analysis failed:', error);
      return {
        allowed: true, // Fail open for availability
        riskLevel: 'low',
        reasons: ['Security analysis unavailable']
      };
    }
  }

  // Get security alerts
  getSecurityAlerts(): SecurityAlert[] {
    return this.alerts.slice().reverse(); // Most recent first
  }

  // Generate security report
  generateSecurityReport(): {
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    topThreats: string[];
    recommendations: string[];
  } {
    const alertsBySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const threatTypes = this.alerts.flatMap(alert => 
      alert.details.threatIntel?.threatTypes || []
    );
    const topThreats = Array.from(new Set(threatTypes)).slice(0, 5);

    const recommendations = [
      'Enable two-factor authentication for all users',
      'Implement IP allowlisting for administrative access',
      'Regular security awareness training',
      'Monitor for unusual access patterns',
      'Keep security integrations updated'
    ];

    return {
      totalAlerts: this.alerts.length,
      alertsBySeverity,
      topThreats,
      recommendations
    };
  }
}

// Export the security integrations
export const securityIntegrations = new SecurityIntegrations();

// Register security routes
export function registerSecurityRoutes(app: Express) {
  // Security dashboard endpoint
  app.get('/api/security/dashboard', isAuthenticated, async (req, res) => {
    try {
      const report = securityIntegrations.generateSecurityReport();
      const alerts = securityIntegrations.getSecurityAlerts().slice(0, 10); // Last 10 alerts
      
      res.json({
        report,
        recentAlerts: alerts,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating security dashboard:', error);
      res.status(500).json({ message: 'Failed to generate security dashboard' });
    }
  });

  // Security alerts endpoint
  app.get('/api/security/alerts', isAuthenticated, async (req, res) => {
    try {
      const alerts = securityIntegrations.getSecurityAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      res.status(500).json({ message: 'Failed to fetch security alerts' });
    }
  });

  // IP analysis endpoint
  app.post('/api/security/analyze-ip', isAuthenticated, async (req, res) => {
    try {
      const { ipAddress } = req.body;
      
      if (!ipAddress) {
        return res.status(400).json({ message: 'IP address is required' });
      }

      const analysis = await securityIntegrations.analyzeRequest({
        ip: ipAddress,
        get: () => 'Unknown',
        user: (req as any).user
      } as any);

      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing IP:', error);
      res.status(500).json({ message: 'Failed to analyze IP address' });
    }
  });

  // Test security integration endpoint
  app.post('/api/security/test-integration', isAuthenticated, async (req, res) => {
    try {
      const testIP = '203.0.113.1'; // Known test malicious IP
      
      const analysis = await securityIntegrations.analyzeRequest({
        ip: testIP,
        get: () => 'Test User Agent',
        user: (req as any).user
      } as any);

      res.json({
        message: 'Security integration test completed',
        analysis,
        testIP
      });
    } catch (error) {
      console.error('Error testing security integration:', error);
      res.status(500).json({ message: 'Security integration test failed' });
    }
  });
}