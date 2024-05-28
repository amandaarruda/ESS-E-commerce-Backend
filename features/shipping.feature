Calcular Tempo Estimado de Entrega
User Story: Como usuário do sistema, eu quero calcular o tempo estimado de entrega de um produto para que eu possa saber o dia em que vou recebê-lo

Cenário: Calcular o tempo estimado de entrega
Given o usuário cliente está logado no sistema
And o usuário cliente está na página “Carrinho”
When o usuário cliente insere o endereço Rua A, 123, Cidade X, CEP 12345-678
Then o sistema  calcula o tempo de entrega para Rua A, 123, Cidade X, CEP 12345-678 de acordo com a distância para a distribuidora da loja
And o sistema deve exibir Entrega estimada em X dias úteis

Cenário: Notificar o cliente quando o endereço de entrega é inválido ou inexistente
Given o usuário cliente está logado no sistema
And o usuário cliente está na página “Carrinho”
When o usuário cliente insere o endereço Endereço Inválido, CEP 00000-000
And o sistema tenta calcular o tempo de entrega para Endereço Inválido, CEP 00000-000 e não consegue encontrá-lo
Then o sistema deve exibir uma mensagem de erro Endereço inválido. Por favor, insira um endereço válido.
Cenário: Novo teste para o roteiro
