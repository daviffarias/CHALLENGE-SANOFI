# FormEase

    Formulário com preenchimento automático de campos repetidos e autocomplete.

## Status

- O autocomplete já está funcionando para o input "Nome do evento". 
- 

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
- [ ] Modelar o banco de dados para ter colunas para cada campo que terá autocomplete  
- [ ] Atualizar os campos que estão faltantes do FMV  
- [ ] Criar algum tipo de perfil admin que tenha controle das variáveis globais para controlar o comportamento global do formulário   
**Ex:** valorTaxaKm = 5  
- [ ] Possivelmente criar sistema de login com apenas uma conta (admin), botão de acesso na tela inicial  
- [x] Adicionar o parâmetro autocomplete="off" em inputs (como o de contato na página inicial) para parar de autocompletar com dados do navegador  

## Bugs:

- Quando eu preencho todo o formulário de pagamento de algum participante, o que eu já tinha preenchido no formulário do evento some  