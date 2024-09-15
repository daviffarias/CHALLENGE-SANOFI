# FormEase

    Formulário com preenchimento automático de campos repetidos e autocomplete.

## Status

- O autocomplete já está funcionando para os inputs necessários.

## Adicionar autocomplete

Para adicionar o autocomplete em algum input, siga os passos:

1. Crie o input e dê um id e um nome;
2. Crie uma div embaixo do input com o id: idDoInput+Suggestions Ex: nomeEventoSuggestions;
3. Utilize a função setupAutocomplete no javascript passando os seguintes parâmetros:
    1. id do input;
    2. id da div;
    3. nome arbitrário do evento, que será utilizado no script php.
 4. Atualize o autocomplete_style adicionando o id da div em todos os blocos;
 5. Copie o if ($_POST['action']) do php, sendo que a action será o nome arbitrário escolhido no passo 3.3;

## TODO:

- [ ] Personalizar o PDF com alguma biblioteca javascript  
- [x] Modelar o banco de dados para ter colunas para cada campo que terá autocomplete  
- [ ] Atualizar os campos que estão faltantes do FMV novo  
- [ ] Criar algum tipo de perfil admin que tenha controle das variáveis globais para controlar o comportamento global do formulário   
**Ex:** valorTaxaKm = 5  
- [ ] Possivelmente criar sistema de login com apenas uma conta (admin), botão de acesso na tela inicial  
- [x] Adicionar o parâmetro autocomplete="off" em inputs (como o de contato na página inicial) para parar de autocompletar com dados do navegador
- [ ] Tempo de Viagem: Colocar o calculo do pagamento de acordo com as faixas de km de deslocamento  
- [x] Ajustar espelhamento da Agenda -> FMV
- [x] Corrigir salvamento (localStorage)
- [x] Ajustar regra de participantes de cada atividade. Participante só pode ser Palestrante **OU** Participação requerida, porém **pode** participar de outras atividades na mesma agenda
- [ ] Otimizar código, remover repetições e padronizar (opcional)

## Bugs:

- [x] Quando eu preencho todo o formulário de pagamento de algum participante, o que eu já tinha preenchido no formulário do evento some  
- [x] Atualmente os participantes da agenda só podem participar de uma atividade. Segundo a regra da Sanofi, eles podem participar de várias atividades dentro de um evento/agenda  
- [ ] O botão de baixar dados combinados (pdf) as vezes não funciona, não consegui identificar o motivo
