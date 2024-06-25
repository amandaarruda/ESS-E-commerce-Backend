export class EmailUtils {
  static getOrderConfirmationEmail(orderCode: string): string {
    return `<h1>Eba! Seu pedido foi confirmado. Agradecemos a preferência pelo seu pedido!</h1>
              <p>Seu pedido com código ${orderCode} foi recebido e está sendo processado.</p>`;
  }
}
