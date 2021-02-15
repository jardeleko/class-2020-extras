import re;

arquivo = open('teste00', 'r')
arquivolist = list(arquivo)     #cria uma lista com o .txt
REDO = []                       #salva quem vai ser feito REDO
UNDO = []                       #salva quem vai ser feito UNDO
ckptREDO = []                   #vetor checkpoint REDO
ckptUNDO = []                   #vetor checkpoint UNDO

#Variaveis p/ identificar se existe no .txt
checkvalue = re.compile(r'T[0-9]*,', re.IGNORECASE) #re.IGNORECASE -> ignorar se maiuscula ou minuscula
commit = re.compile(r'commit', re.IGNORECASE) #re.IGNORECASE -> ignorar se maiuscula ou minuscula
start = re.compile(r'start', re.IGNORECASE) #variaveis que faltavam a serem analisadas start transaction
begin_ckpt = re.compile(r'start ckpt', re.IGNORECASE) #inicio do checkpoint
end_ckpt = re.compile(r'end ckpt', re.IGNORECASE)   #fim do checkpoint
extracT = re.compile(r'(?!commit\b)(?!CKPT\b)(?!Start\b)\b\w+', re.IGNORECASE) #Ignora as palavras descritas e coloca as demais em uma lista com .findall
words = re.compile(r'\w+', re.IGNORECASE)   #Utilizado p/ pegar o valor das variaveis

valores = words.findall(arquivolist[0])
variaveis = {}
#variaveis_tmp = variaveis

for i in range(0,len(valores),2): #Iniciar primeiros valores das variáveis (A B C...)
    variaveis[valores[i]]= valores[i+1]
del valores
print("", variaveis)
end = 0

#primeiro for é a analise de commit e end checkpoint para escrita em banco

for linha in reversed(arquivolist): #Verificar os casos e criar as listas de REDO 
    if begin_ckpt.search(linha): #se não encontrar o endckpt ignora o ckpt
        if end:                  #se encontrar o fim ele valida o ckpt
            print('start CKPT')  #mostra o inicio do ckpt   
            Tn = extracT.findall(linha) #Verifica a transação a ser commitada com n>=0
            for i in range(0, len(Tn)):
                if Tn[i] not in REDO: #se não houver redo em Tn[i]
                    UNDO.append(Tn[i]) #se nenhum valor atualizado, resgata o valor antigo na lista undo
            break

    elif start.search(linha): #proocura start ou inicio de uma transação normal
        Tn = extracT.findall(linha)[0] #Ignora as palavras descritas e coloca as demais em uma lista com 
        if Tn not in REDO:
            UNDO.append(Tn)
    
    elif commit.search(linha):  #Procura commit
        REDO.append(extracT.findall(linha)[0]) #escreve o log no banco 
    
    elif end_ckpt.search(linha):
        print('end CKPT')
        end = 1

print('\n\n')
print("Aplicado REDO:", REDO, "\n")
print("Aplicado UNDO:", UNDO, "\n")
print('\n\n')

for i in range(len(arquivolist) -1, 0, -1):
    linha = arquivolist[i]  
    
    if start.search(linha) and not begin_ckpt.search(linha): #se iniciou uma transação e não um ckpt
        Tn = extracT.findall(linha)[0]
        
        if Tn in UNDO: #se existe undo sem endcheckpoint        
            UNDO.remove(Tn) #remove do undo
            ckptUNDO.append(Tn) #inclui na lista de ckpt 

        if Tn in REDO:
            REDO.remove(Tn)
            ckptREDO.append(Tn)
        if not len(REDO) and not len(UNDO):
            break

    elif words.findall(linha) in UNDO:
        variaveis[words.findall(linha)[1]] = words.findall(linha)[2]

for j in range(i,len(arquivolist)-1,1):
    linha = arquivolist[j]
    if words.findall(linha)[0] in ckptREDO:
        variaveis[words.findall(linha)[1]] = words.findall(linha)[2]

   
print("Aplicado UNDO:", ckptUNDO,  "\n") #se não commitou inclui neste vetor
print("Aplicado REDO:", ckptREDO, "\n") #se todos commits aconteceram estaram printados nesta list
print("Resultado:", variaveis) #resultado final das variaveis 

print('\n\n')

arquivo.close()

#code baseado a partir do codigo do Professor 

#observações T2 esta com undo em teste01, porém
# o end ckpt de T4 acaba limpando os undos e redo, Ou seja, insere os logs no bd
# ao tirar novamente temos os commits anteriormente incluidos e os undos ativos

