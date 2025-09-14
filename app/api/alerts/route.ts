import { NextRequest, NextResponse } from 'next/server';
import { advancedAlertsService } from '@/server/advanced-alerts-service';

// Helper function to get user ID from request
function getUserId(request: NextRequest): string | null {
  try {
    // Extract user ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token && token !== '') {
        // In a real environment, this would validate JWT/session token
        // For now, using the token as user ID if present
        return token;
      }
    }
    
    // No valid authentication found
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'rules';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const symbol = searchParams.get('symbol');

    switch (type) {
      case 'rules':
        const alertRules = advancedAlertsService.getUserAlertRules(userId);
        return NextResponse.json({
          alerts: alertRules,
          total: alertRules.length,
          timestamp: new Date().toISOString()
        });
      
      case 'triggered':
        const triggeredAlerts = advancedAlertsService.getTriggeredAlerts(userId, limit);
        return NextResponse.json({
          alerts: triggeredAlerts,
          total: triggeredAlerts.length,
          timestamp: new Date().toISOString()
        });
      
      case 'technical':
        if (!symbol) {
          return NextResponse.json(
            { error: 'Symbol parameter required for technical indicators' },
            { status: 400 }
          );
        }
        const indicators = advancedAlertsService.getTechnicalIndicators(symbol.toUpperCase());
        return NextResponse.json(indicators);
      
      case 'whale-movements':
        const movements = advancedAlertsService.getWhaleMovements(symbol?.toUpperCase(), limit);
        return NextResponse.json(movements);
      
      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported types: rules, triggered, technical, whale-movements' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Alerts GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'create';
    const body = await request.json();

    switch (action) {
      case 'create':
        // Validate required fields for alert creation
        const requiredFields = ['name', 'symbol', 'conditions'];
        for (const field of requiredFields) {
          if (!(field in body)) {
            return NextResponse.json(
              { error: `Missing required field: ${field}` },
              { status: 400 }
            );
          }
        }

        // Set defaults for missing optional fields
        const alertRule = {
          name: body.name,
          symbol: body.symbol.toUpperCase(),
          conditions: body.conditions,
          logic: body.logic || 'AND',
          channels: body.channels || ['push'],
          priority: body.priority || 'medium',
          isActive: body.isActive !== false,
          cooldown: body.cooldown || 30
        };

        const createdAlert = await advancedAlertsService.createAlertRule(userId, alertRule);
        return NextResponse.json(createdAlert, { status: 201 });
      
      case 'acknowledge':
        const { alertId } = body;
        if (!alertId) {
          return NextResponse.json(
            { error: 'Alert ID required for acknowledgment' },
            { status: 400 }
          );
        }

        const acknowledged = advancedAlertsService.acknowledgeAlert(alertId);
        if (!acknowledged) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ message: 'Alert acknowledged successfully' });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: create, acknowledge' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Alerts POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process alert request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');
    
    if (!ruleId) {
      return NextResponse.json(
        { error: 'Alert rule ID required for update' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const updatedRule = await advancedAlertsService.updateAlertRule(ruleId, updates);
    
    if (!updatedRule) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Alerts PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');
    
    if (!ruleId) {
      return NextResponse.json(
        { error: 'Alert rule ID required for deletion' },
        { status: 400 }
      );
    }

    const deleted = await advancedAlertsService.deleteAlertRule(ruleId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Alert rule deleted successfully' });
  } catch (error) {
    console.error('Alerts DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert rule' },
      { status: 500 }
    );
  }
}