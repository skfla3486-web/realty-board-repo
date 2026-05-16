export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 가능' })
 
  const NOTION_KEY = process.env.NOTION_KEY
  const DB_ID = process.env.NOTION_DB_ID
  if (!NOTION_KEY || !DB_ID) return res.status(500).json({ error: '노션 환경변수 없음' })
 
  try {
    const d = req.body
 
    const properties = {
      '사건번호': { title: [{ text: { content: d.caseNo || '' } }] },
      '관할법원': { select: { name: d.court || '미선택' } },
      '매각기일': d.saleDate ? { date: { start: d.saleDate } } : undefined,
      '입찰가': { number: parseInt(String(d.bidPrice).replace(/,/g, '')) || 0 },
      '입찰유형': { select: { name: d.bidType || '개인' } },
      '성명': { rich_text: [{ text: { content: d.name || '' } }] },
      '주민번호': { rich_text: [{ text: { content: d.ssn || '' } }] },
      '주소': { rich_text: [{ text: { content: d.address || '' } }] },
      '휴대폰': { rich_text: [{ text: { content: d.phone || '' } }] },
      '은행': d.bank ? { select: { name: d.bank } } : undefined,
      '계좌번호': { rich_text: [{ text: { content: d.account || '' } }] },
      '회사명': { rich_text: [{ text: { content: d.company || '' } }] },
      '대표자지위': { rich_text: [{ text: { content: d.repTitle || '' } }] },
      '사업자번호': { rich_text: [{ text: { content: d.bizNo || '' } }] },
      '법인번호': { rich_text: [{ text: { content: d.corpNo || '' } }] },
      '신청일시': { date: { start: new Date().toISOString() } }
    }
 
    // undefined 제거
    Object.keys(properties).forEach(k => { if (!properties[k]) delete properties[k] })
 
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: properties
      })
    })
 
    const result = await response.json()
 
    if (!response.ok) {
      return res.status(400).json({ error: result.message || '노션 저장 실패', detail: result })
    }
 
    res.status(200).json({ success: true, id: result.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
