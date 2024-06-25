Feature: Calcular o tempo estimado de entrega e notificar o cliente

  Scenario: Calcular o tempo estimado de entrega
    When o usuário cliente insere o CEP "12345-678"
    Then o sistema calcula o tempo de entrega para CEP "12345-678" de acordo com a distância para a distribuidora da loja
    And o serviço deve retornar "Entrega estimada em 5 dias úteis"

  Scenario: Notificar o cliente quando o endereço de entrega é inválido ou inexistente
    When o usuário cliente insere o endereço de CEP "13171-779"
    Then o sistema tenta calcular o tempo de entrega para o CEP "13171-779" e não consegue encontrá-lo
    And o serviço deve retornar uma mensagem de erro "Endereço inválido. Por favor, insira um endereço válido."
