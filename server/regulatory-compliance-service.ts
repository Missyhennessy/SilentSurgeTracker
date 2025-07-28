import { randomInt, randomUUID } from "crypto";

// Types for regulatory compliance
interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  jurisdiction: string;
  category: 'AML' | 'KYC' | 'CTF' | 'GDPR' | 'MiCA' | 'BSA' | 'FATF';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  effectiveDate: Date;
  thresholds: {
    amount?: number;
    frequency?: number;
    timeWindow?: number;
  };
}

interface ComplianceAlert {
  id: string;
  ruleId: string;
  address: string;
  transactionHash?: string;
  alertType: 'suspicious_activity' | 'threshold_breach' | 'sanctions_hit' | 'pattern_match';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  evidence: {
    transactionAmount?: number;
    frequency?: number;
    riskScore: number;
    patterns: string[];
  };
}

interface RegulatoryReport {
  id: string;
  reportType: 'SAR' | 'CTR' | 'FBAR' | 'SUSPICIOUS_ACTIVITY' | 'COMPLIANCE_SUMMARY';
  period: {
    start: Date;
    end: Date;
  };
  jurisdiction: string;
  totalTransactions: number;
  flaggedTransactions: number;
  totalValue: number;
  highRiskValue: number;
  complianceScore: number;
  findings: string[];
  recommendations: string[];
  generatedAt: Date;
}

interface JurisdictionRequirement {
  jurisdiction: string;
  requirements: {
    kyc: boolean;
    aml: boolean;
    reporting: boolean;
    licensing: boolean;
  };
  thresholds: {
    dailyLimit: number;
    monthlyLimit: number;
    reportingThreshold: number;
  };
  restrictedCountries: string[];
  sanctions: string[];
}

class RegulatoryComplianceService {
  private jurisdictions = ['US', 'EU', 'UK', 'Canada', 'Australia', 'Japan', 'Singapore'];
  private alertTypes = ['suspicious_activity', 'threshold_breach', 'sanctions_hit', 'pattern_match'] as const;
  private categories = ['AML', 'KYC', 'CTF', 'GDPR', 'MiCA', 'BSA', 'FATF'] as const;

  // Generate compliance rules
  generateComplianceRules(): ComplianceRule[] {
    const rules: ComplianceRule[] = [
      {
        id: 'rule_001',
        name: 'Large Transaction Monitoring',
        description: 'Monitor transactions exceeding $10,000 USD equivalent',
        jurisdiction: 'US',
        category: 'AML',
        severity: 'high',
        isActive: true,
        effectiveDate: new Date('2023-01-01'),
        thresholds: { amount: 10000, timeWindow: 86400000 }
      },
      {
        id: 'rule_002',
        name: 'Structured Transaction Detection',
        description: 'Detect patterns of transactions just below reporting thresholds',
        jurisdiction: 'EU',
        category: 'AML',
        severity: 'critical',
        isActive: true,
        effectiveDate: new Date('2023-06-01'),
        thresholds: { amount: 9000, frequency: 3, timeWindow: 86400000 }
      },
      {
        id: 'rule_003',
        name: 'High-Risk Country Monitoring',
        description: 'Enhanced monitoring for transactions from/to high-risk jurisdictions',
        jurisdiction: 'Global',
        category: 'CTF',
        severity: 'high',
        isActive: true,
        effectiveDate: new Date('2023-03-01'),
        thresholds: { amount: 1000 }
      },
      {
        id: 'rule_004',
        name: 'Privacy Coin Usage',
        description: 'Monitor usage of privacy-focused cryptocurrencies',
        jurisdiction: 'US',
        category: 'AML',
        severity: 'medium',
        isActive: true,
        effectiveDate: new Date('2023-09-01'),
        thresholds: { amount: 5000 }
      },
      {
        id: 'rule_005',
        name: 'Rapid Movement Pattern',
        description: 'Detect rapid movement of funds through multiple addresses',
        jurisdiction: 'UK',
        category: 'AML',
        severity: 'high',
        isActive: true,
        effectiveDate: new Date('2023-07-01'),
        thresholds: { frequency: 5, timeWindow: 3600000 }
      }
    ];

    return rules;
  }

  // Generate compliance alerts
  generateComplianceAlerts(count: number = 20): ComplianceAlert[] {
    const rules = this.generateComplianceRules();
    return Array.from({ length: count }, () => {
      const rule = rules[randomInt(0, rules.length)];
      const alertType = this.alertTypes[randomInt(0, this.alertTypes.length)];
      const severity = ['low', 'medium', 'high', 'critical'][randomInt(0, 4)] as any;
      
      return {
        id: `alert_${randomUUID().slice(0, 8)}`,
        ruleId: rule.id,
        address: `0x${randomUUID().slice(0, 8)}...${randomUUID().slice(-8)}`,
        transactionHash: Math.random() > 0.3 ? `0x${randomUUID().replace(/-/g, '')}` : undefined,
        alertType,
        severity,
        description: this.generateAlertDescription(alertType, rule.name),
        timestamp: new Date(Date.now() - randomInt(0, 86400000 * 7)),
        status: ['open', 'investigating', 'resolved', 'false_positive'][randomInt(0, 4)] as any,
        assignedTo: Math.random() > 0.5 ? `analyst_${randomInt(1, 5)}` : undefined,
        evidence: {
          transactionAmount: Math.random() * 100000,
          frequency: randomInt(1, 20),
          riskScore: Math.random() * 100,
          patterns: this.generatePatterns()
        }
      };
    });
  }

  // Generate regulatory report
  generateRegulatoryReport(reportType: string, jurisdiction: string): RegulatoryReport {
    const totalTransactions = randomInt(10000, 100000);
    const flaggedTransactions = randomInt(100, Math.floor(totalTransactions * 0.1));
    const totalValue = Math.random() * 1000000000;
    const highRiskValue = Math.random() * totalValue * 0.2;
    
    return {
      id: `report_${randomUUID().slice(0, 8)}`,
      reportType: reportType as any,
      period: {
        start: new Date(Date.now() - 86400000 * 30),
        end: new Date()
      },
      jurisdiction,
      totalTransactions,
      flaggedTransactions,
      totalValue,
      highRiskValue,
      complianceScore: 75 + Math.random() * 25,
      findings: this.generateFindings(),
      recommendations: this.generateRecommendations(),
      generatedAt: new Date()
    };
  }

  // Get jurisdiction requirements
  getJurisdictionRequirements(): JurisdictionRequirement[] {
    return [
      {
        jurisdiction: 'US',
        requirements: { kyc: true, aml: true, reporting: true, licensing: true },
        thresholds: { dailyLimit: 25000, monthlyLimit: 100000, reportingThreshold: 10000 },
        restrictedCountries: ['Iran', 'North Korea', 'Syria', 'Cuba'],
        sanctions: ['OFAC SDN', 'OFAC Non-SDN']
      },
      {
        jurisdiction: 'EU',
        requirements: { kyc: true, aml: true, reporting: true, licensing: true },
        thresholds: { dailyLimit: 20000, monthlyLimit: 80000, reportingThreshold: 15000 },
        restrictedCountries: ['Russia', 'Belarus', 'Iran', 'North Korea'],
        sanctions: ['EU Sanctions List', 'UN Security Council']
      },
      {
        jurisdiction: 'UK',
        requirements: { kyc: true, aml: true, reporting: true, licensing: true },
        thresholds: { dailyLimit: 22000, monthlyLimit: 90000, reportingThreshold: 12000 },
        restrictedCountries: ['Iran', 'North Korea', 'Syria'],
        sanctions: ['UK Sanctions List', 'OFAC SDN']
      },
      {
        jurisdiction: 'Singapore',
        requirements: { kyc: true, aml: true, reporting: false, licensing: true },
        thresholds: { dailyLimit: 30000, monthlyLimit: 120000, reportingThreshold: 20000 },
        restrictedCountries: ['North Korea'],
        sanctions: ['MAS Sanctions', 'UN Security Council']
      }
    ];
  }

  // Risk assessment for transaction
  assessTransactionRisk(amount: number, addresses: string[], jurisdiction: string): {
    riskScore: number;
    riskLevel: string;
    flags: string[];
    complianceStatus: string;
  } {
    let riskScore = 0;
    const flags: string[] = [];

    // Amount-based risk
    if (amount > 50000) {
      riskScore += 30;
      flags.push('Large Amount');
    }
    if (amount > 100000) {
      riskScore += 20;
      flags.push('Very Large Amount');
    }

    // Address-based risk
    if (addresses.length > 10) {
      riskScore += 15;
      flags.push('Multiple Addresses');
    }

    // Random additional factors
    if (Math.random() > 0.8) {
      riskScore += 25;
      flags.push('High-Risk Exchange');
    }
    if (Math.random() > 0.9) {
      riskScore += 40;
      flags.push('Sanctions Match');
    }

    const riskLevel = riskScore < 25 ? 'low' : riskScore < 50 ? 'medium' : riskScore < 75 ? 'high' : 'critical';
    const complianceStatus = riskScore < 60 ? 'compliant' : riskScore < 80 ? 'review_required' : 'blocked';

    return { riskScore, riskLevel, flags, complianceStatus };
  }

  // Helper methods
  private generateAlertDescription(alertType: string, ruleName: string): string {
    const descriptions = {
      suspicious_activity: `Suspicious activity detected related to ${ruleName}`,
      threshold_breach: `Transaction threshold exceeded for ${ruleName}`,
      sanctions_hit: `Potential sanctions match identified in ${ruleName}`,
      pattern_match: `Suspicious pattern detected matching ${ruleName} criteria`
    };
    return descriptions[alertType as keyof typeof descriptions] || 'Compliance alert triggered';
  }

  private generatePatterns(): string[] {
    const patterns = [
      'Structuring', 'Layering', 'Round Dollar Amounts', 'Velocity',
      'Geographical Risk', 'PEP Connection', 'Sanctions List',
      'Privacy Coins', 'Mixer Usage', 'High-Risk Exchange'
    ];
    const count = randomInt(1, 4);
    return Array.from({ length: count }, () => patterns[randomInt(0, patterns.length)]);
  }

  private generateFindings(): string[] {
    return [
      'Identified 127 transactions exceeding reporting thresholds',
      'Detected 23 potential structuring patterns',
      'Found 8 transactions involving high-risk jurisdictions',
      'Discovered 5 addresses with sanctions list matches',
      'Observed increased usage of privacy-focused cryptocurrencies'
    ];
  }

  private generateRecommendations(): string[] {
    return [
      'Enhance monitoring of structured transaction patterns',
      'Implement additional KYC verification for high-risk customers',
      'Review and update sanctions screening procedures',
      'Increase transaction monitoring thresholds for certain regions',
      'Provide additional AML training to compliance staff'
    ];
  }
}

export const regulatoryComplianceService = new RegulatoryComplianceService();
export type { ComplianceRule, ComplianceAlert, RegulatoryReport, JurisdictionRequirement };