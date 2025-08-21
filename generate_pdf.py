#!/usr/bin/env python3

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import os

def create_pitch_deck_pdf():
    # Create PDF document
    doc = SimpleDocTemplate(
        "Silent_Surge_Tracker_Pitch_Deck.pdf",
        pagesize=A4,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
        leftMargin=0.5*inch,
        rightMargin=0.5*inch
    )
    
    # Custom styles
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=HexColor('#1e40af'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Slide title style
    slide_title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=HexColor('#059669'),
        spaceAfter=15,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Subtitle style
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#374151'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Body text style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=12,
        textColor=HexColor('#111827'),
        spaceAfter=8,
        leftIndent=20,
        fontName='Helvetica'
    )
    
    # Bullet style
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontSize=12,
        textColor=HexColor('#111827'),
        spaceAfter=6,
        leftIndent=30,
        bulletIndent=20,
        fontName='Helvetica'
    )
    
    # Metric style
    metric_style = ParagraphStyle(
        'Metric',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#059669'),
        spaceAfter=8,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Build story content
    story = []
    
    # Cover slide
    story.append(Paragraph("SILENT SURGE TRACKER", title_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Discover the Next Big Crypto Before Everyone Else", subtitle_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("AI-powered cryptocurrency intelligence platform that identifies high-potential assets 30-90 days before mainstream discovery", body_style))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("[Visual: Professional dashboard showing real-time SSS scores for 7,000+ cryptocurrencies]", 
                          ParagraphStyle('ImagePlaceholder', parent=styles['Normal'], fontSize=10, textColor=HexColor('#6b7280'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Oblique')))
    story.append(PageBreak())
    
    # Problem slide
    story.append(Paragraph("THE PROBLEM", slide_title_style))
    story.append(Paragraph("95% of Crypto Investors Lose Money", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Problem stats
    problem_data = [
        ["95%", "20,000+", "80%+"],
        ["of crypto investors consistently lose money", "cryptocurrencies impossible to analyze manually", "of gains captured before discovery"]
    ]
    problem_table = Table(problem_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    problem_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 20),
        ('FONTSIZE', (0, 1), (-1, 1), 10),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#dc2626')),
        ('TEXTCOLOR', (0, 1), (-1, 1), HexColor('#374151')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(problem_table)
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Three Critical Failures:</b>", body_style))
    story.append(Paragraph("• <b>Late Discovery Problem</b> - Investors find opportunities after 80%+ gains already captured", bullet_style))
    story.append(Paragraph("• <b>Information Overload</b> - 20,000+ cryptocurrencies with no reliable early-warning system", bullet_style))
    story.append(Paragraph("• <b>Failed Analysis Methods</b> - Traditional technical analysis misses behavioral market signals", bullet_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<i>\"By the time everyone knows about a crypto opportunity, it's already too late.\"</i>", 
                          ParagraphStyle('Quote', parent=styles['Normal'], fontSize=14, textColor=HexColor('#059669'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Oblique')))
    story.append(PageBreak())
    
    # Solution slide
    story.append(Paragraph("THE SOLUTION", slide_title_style))
    story.append(Paragraph("The Silent Surge Score (SSS)", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Patent-pending algorithm that identifies crypto opportunities <b>30-90 days early</b>", body_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Six Behavioral Indicators:</b>", body_style))
    story.append(Paragraph("• <b>Behavioral Activity (25%)</b> - Community engagement patterns", bullet_style))
    story.append(Paragraph("• <b>Token Velocity Anomaly (20%)</b> - Unusual transaction flows", bullet_style))
    story.append(Paragraph("• <b>Community Cohesion (15%)</b> - Network strength analysis", bullet_style))
    story.append(Paragraph("• <b>Anchor Pressure (15%)</b> - Market maker behavior", bullet_style))
    story.append(Paragraph("• <b>Hype-to-Hold Ratio (15%)</b> - Sentiment vs. accumulation", bullet_style))
    story.append(Paragraph("• <b>Historical Volatility (10%)</b> - Price pattern recognition", bullet_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Key metrics
    solution_data = [["86%+ Accuracy", "278ms Response Time", "First Behavioral ML Platform"]]
    solution_table = Table(solution_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    solution_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#059669')),
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#059669')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(solution_table)
    story.append(PageBreak())
    
    # Product slide
    story.append(Paragraph("PRODUCT", slide_title_style))
    story.append(Paragraph("Real-Time Intelligence Dashboard", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("[Visual Asset: Professional dashboard showing real-time SSS scores for 7,099+ monitored assets]", 
                          ParagraphStyle('ImagePlaceholder', parent=styles['Normal'], fontSize=10, textColor=HexColor('#6b7280'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Oblique')))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Platform Capabilities:</b>", body_style))
    story.append(Paragraph("• <b>7,099+ Cryptocurrencies</b> monitored continuously", bullet_style))
    story.append(Paragraph("• <b>278ms Response Time</b> for instant analysis", bullet_style))
    story.append(Paragraph("• <b>Live SSS Calculations</b> with behavioral heatmaps", bullet_style))
    story.append(Paragraph("• <b>Predictive Alerts</b> for emerging opportunities", bullet_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Current Live Data (January 2025):</b>", body_style))
    story.append(Paragraph("• <b>EGN (Edu3Games):</b> SSS Score 99.6 - Exceptional breakout potential at $0.037", bullet_style))
    story.append(Paragraph("• <b>DIVI:</b> SSS Score 99.7 - Highest rated opportunity at $0.0016", bullet_style))
    story.append(Paragraph("• <b>EUL (Euler):</b> SSS Score 94.0 - Strong institutional signals at $13.38", bullet_style))
    story.append(Paragraph("• <b>CGV (Cogito Finance):</b> SSS Score 90.0 - Advanced DeFi opportunity at $0.0046", bullet_style))
    story.append(PageBreak())
    
    # Traction slide
    story.append(Paragraph("TRACTION", slide_title_style))
    story.append(Paragraph("Strong Early Validation & Platform Performance", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Traction stats
    traction_data = [
        ["7,099", "86%+", "A+"],
        ["cryptocurrencies monitored with avg SSS 46.3", "prediction accuracy across market conditions", "security rating - institutional grade"]
    ]
    traction_table = Table(traction_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    traction_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 18),
        ('FONTSIZE', (0, 1), (-1, 1), 10),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#059669')),
        ('TEXTCOLOR', (0, 1), (-1, 1), HexColor('#374151')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(traction_table)
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Technical Achievements:</b>", body_style))
    story.append(Paragraph("• Patent-pending algorithm operational at scale", bullet_style))
    story.append(Paragraph("• Real-time ML processing with 278ms response time", bullet_style))
    story.append(Paragraph("• 99.9% system uptime with comprehensive monitoring", bullet_style))
    story.append(Paragraph("• Multi-API integration ensuring data redundancy", bullet_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>User Validation:</b>", body_style))
    story.append(Paragraph("• Professional traders requesting enterprise access", bullet_style))
    story.append(Paragraph("• Institutional inquiries for API licensing", bullet_style))
    story.append(Paragraph("• Recent successful predictions: CLBTC, SUI breakouts confirmed", bullet_style))
    story.append(PageBreak())
    
    # Market Opportunity slide
    story.append(Paragraph("MARKET OPPORTUNITY", slide_title_style))
    story.append(Paragraph("$8.2B Crypto Analytics Market with 23.8% CAGR Growth", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("[Visual Asset: Market opportunity analysis showing TAM/SAM/SOM breakdown]", 
                          ParagraphStyle('ImagePlaceholder', parent=styles['Normal'], fontSize=10, textColor=HexColor('#6b7280'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Oblique')))
    story.append(Spacer(1, 0.3*inch))
    
    # Market data
    market_data = [
        ["TAM", "SAM", "SOM"],
        ["$8.2B", "$7.2B", "$37M"],
        ["Total Market", "Addressable", "Our Target"]
    ]
    market_table = Table(market_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    market_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, 1), 20),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 2), (-1, 2), 10),
        ('TEXTCOLOR', (0, 1), (-1, 1), HexColor('#059669')),
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#374151')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(market_table)
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Market Segments:</b>", body_style))
    story.append(Paragraph("• <b>Professional Traders:</b> $2.1B (500K+ traders, $4.2K avg spend)", bullet_style))
    story.append(Paragraph("• <b>Institutional Funds:</b> $3.7B (2,300+ funds, $1.6M avg budget)", bullet_style))
    story.append(Paragraph("• <b>Retail Investors:</b> $1.4B (420M+ investors, growing demand)", bullet_style))
    story.append(PageBreak())
    
    # Business Model slide
    story.append(Paragraph("BUSINESS MODEL", slide_title_style))
    story.append(Paragraph("Freemium SaaS with Strong Unit Economics", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("[Visual Asset: Three-tier pricing strategy with revenue projections]", 
                          ParagraphStyle('ImagePlaceholder', parent=styles['Normal'], fontSize=10, textColor=HexColor('#6b7280'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Oblique')))
    story.append(Spacer(1, 0.3*inch))
    
    # Pricing tiers
    pricing_data = [
        ["🆓 Free Tier", "💎 Premium ($29/month)", "🏢 Enterprise ($500-5K/month)"],
        ["Basic SSS access, limited monitoring", "Full 7,000+ coverage, ML predictions", "White-label, custom integrations"],
        ["User Acquisition", "$29 × 15K = $5.22M by Y3", "$600 avg × 500 = $3M by Y3"]
    ]
    pricing_table = Table(pricing_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    pricing_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTSIZE', (0, 1), (-1, 1), 10),
        ('FONTSIZE', (0, 2), (-1, 2), 11),
        ('TEXTCOLOR', (0, 2), (-1, 2), HexColor('#059669')),
        ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#374151')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(pricing_table)
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Revenue Projections:</b>", body_style))
    story.append(Paragraph("• <b>Year 1:</b> $648K (1K premium + 50 enterprise)", bullet_style))
    story.append(Paragraph("• <b>Year 2:</b> $2.94M (5K premium + 200 enterprise)", bullet_style))
    story.append(Paragraph("• <b>Year 3:</b> $8.22M (15K premium + 500 enterprise)", bullet_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Unit economics
    unit_data = [["85% Gross Margin", "7:1 LTV/CAC Premium", "24:1 LTV/CAC Enterprise"]]
    unit_table = Table(unit_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    unit_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#059669')),
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#059669')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(unit_table)
    story.append(PageBreak())
    
    # Go-to-Market slide
    story.append(Paragraph("GO-TO-MARKET STRATEGY", slide_title_style))
    story.append(Paragraph("Multi-Channel Customer Acquisition", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Phase 1: Product-Led Growth (Months 1-6)</b>", body_style))
    story.append(Paragraph("• Launch freemium platform with viral features", bullet_style))
    story.append(Paragraph("• Content marketing & SEO targeting \"crypto analysis\"", bullet_style))
    story.append(Paragraph("• Crypto community engagement (Discord, Telegram, Reddit)", bullet_style))
    story.append(Paragraph("• Influencer partnerships with successful predictions", bullet_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Phase 2: Sales-Led Expansion (Months 7-12)</b>", body_style))
    story.append(Paragraph("• Direct institutional sales to hedge funds", bullet_style))
    story.append(Paragraph("• Strategic partnerships with exchanges and platforms", bullet_style))
    story.append(Paragraph("• API licensing to fintech companies", bullet_style))
    story.append(Paragraph("• Conference presence at major crypto events", bullet_style))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Phase 3: Scale & Leadership (Year 2+)</b>", body_style))
    story.append(Paragraph("• International expansion (Europe, Asia)", bullet_style))
    story.append(Paragraph("• Strategic acquisitions of complementary tech", bullet_style))
    story.append(Paragraph("• Market leadership through thought leadership", bullet_style))
    story.append(Paragraph("• IPO preparation and strategic exit planning", bullet_style))
    story.append(Spacer(1, 0.3*inch))
    
    # CAC/LTV metrics
    cac_data = [
        ["Digital Marketing", "Enterprise Sales", "Partnership Referrals"],
        ["$50 CAC → $348 LTV", "$500 CAC → $12K LTV", "$25 CAC → $520 LTV"],
        ["7:1 Ratio", "24:1 Ratio", "20:1 Ratio"]
    ]
    cac_table = Table(cac_data, colWidths=[2.5*inch, 2.5*inch, 2.5*inch])
    cac_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 2), (-1, 2), HexColor('#059669')),
        ('BOX', (0, 0), (-1, -1), 1, HexColor('#374151')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cac_table)
    story.append(PageBreak())
    
    # Final summary slide
    story.append(Paragraph("INVESTMENT OPPORTUNITY", slide_title_style))
    story.append(Paragraph("Join Us in Revolutionizing Crypto Investment", subtitle_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Key Investment Highlights:</b>", body_style))
    story.append(Paragraph("• <b>Massive Market:</b> $8.2B market with 23.8% CAGR growth", bullet_style))
    story.append(Paragraph("• <b>Proprietary Technology:</b> Patent-pending algorithm with 86%+ accuracy", bullet_style))
    story.append(Paragraph("• <b>Strong Traction:</b> 7,099+ cryptocurrencies monitored, A+ security rating", bullet_style))
    story.append(Paragraph("• <b>Proven Performance:</b> Recent successful predictions validated", bullet_style))
    story.append(Paragraph("• <b>Clear Path to Scale:</b> $8.22M revenue by Year 3", bullet_style))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>The Ask: $2.5M Seed Round</b>", 
                          ParagraphStyle('Ask', parent=styles['Normal'], fontSize=18, textColor=HexColor('#dc2626'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Bold')))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("18-month runway to profitability and Series A readiness", 
                          ParagraphStyle('Timeline', parent=styles['Normal'], fontSize=12, textColor=HexColor('#374151'), 
                                        alignment=TA_CENTER, fontName='Helvetica')))
    story.append(Spacer(1, 0.5*inch))
    
    story.append(Paragraph("Contact: Ready for live demo and due diligence", 
                          ParagraphStyle('Contact', parent=styles['Normal'], fontSize=14, textColor=HexColor('#059669'), 
                                        alignment=TA_CENTER, fontName='Helvetica-Bold')))
    
    # Build PDF
    doc.build(story)
    print("PDF created successfully: Silent_Surge_Tracker_Pitch_Deck.pdf")

if __name__ == "__main__":
    create_pitch_deck_pdf()