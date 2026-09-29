export function formatTlv(tag: string, value: string): string {
    const len = String(value.length).padStart(2, '0');
    return tag + len + value;
}

export function calculateCrc16Ccitt(str: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= (str.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generateAbaDynamicKhqr(amountUsd: number, billNo = ''): string {
    const formattedAmount = Number(amountUsd).toFixed(2);
    const invoiceBillNo = billNo || ('INV-' + Date.now().toString().slice(-6));

    // ABA Bank Tag 29 & Tag 40 (KIMPHEV LY - 501275283)
    const tag29 = formatTlv('29', 
        formatTlv('00', 'abaakhppxxx@abaa') + 
        formatTlv('01', '501275283') + 
        formatTlv('02', 'ABA Bank')
    );

    const tag40 = formatTlv('40',
        formatTlv('00', 'abaP2P') +
        formatTlv('01', '753AB6A3AE1D') +
        formatTlv('02', '501275283') +
        formatTlv('03', '004583185') +
        formatTlv('04', 'Dual')
    );

    const tag62 = formatTlv('62', formatTlv('01', invoiceBillNo));

    // Dynamic KHQR (Point of Initiation = 12) with Tag 54 (Amount)
    const payload = ''
        + formatTlv('00', '01')
        + formatTlv('01', '12') // 12 = Dynamic QR (Auto-sets price on customer's phone!)
        + tag29
        + tag40
        + formatTlv('52', '0000')
        + formatTlv('53', '840') // 840 = USD
        + formatTlv('54', formattedAmount) // Tag 54: Exact Amount
        + formatTlv('58', 'KH')
        + formatTlv('59', 'KIMPHEV LY')
        + formatTlv('60', 'Phnom Penh')
        + tag62;

    const payloadWithTag63 = payload + '6304';
    const crc = calculateCrc16Ccitt(payloadWithTag63);
    return payloadWithTag63 + crc;
}
