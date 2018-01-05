# Challenge Engineering : Web Scrapping

## Le principe

Scrapper la page suivante en un temps record : https://web.bankin.com/challenge/index.html (site de très grande qualité)

Le robot devra retourner un JSON contenant les 4 éléments suivants : Account, Transaction, Amount, Currency.

Pour ce faire, tu devras choisis parmi les armes suivantes : NodeJS, CasperJS, PhantomJS, Chrome Headless, Firefox Headless, Selenium.

## Comment gagner

 - Postuler dans les temps en respectant les consignes
 - Retourner **toutes** les transactions disponibles
 - Fiabilité 100%. Éliminatoire dans le cas contraire. Attention aux embuches, comme tu pourras le constater le site à scrapper semble avoir été codé avec les pieds.
 - Avoir un script qui va vite (2/4 de la note) — les aléas de temps de chargements seront bien sûr éliminés lors des tests de rapidité des robots
 - Avoir un script propre (1/4 de la note)
 - Avoir un script commenté (1/4 de la note)

## Analyse de la page

La page https://web.bankin.com/challenge/index.html contient un tableau de transactions :

| Account  | Transaction    | Amount |
|----------|----------------|--------|
| Checking | Transaction 1  | 73€    |
| Checking | Transaction 2  | 54€    |
| ...      | ...            | ...    |
| Checking | Transaction 50 | 114€   |

et un lien `Next -->` vers https://web.bankin.com/challenge/index.html?start=100

Quand on suit le lien, on obtient les transations suivantes :

| Account  | Transaction     | Amount |
|----------|-----------------|--------|
| Checking | Transaction 101 | 49€    |
| Checking | Transaction 102 | 34€    |
| ...      | ...             | ...    |
| Checking | Transaction 150 | 122€   |

mais le lien `Next -->` lui ne change pas.

## Comment réconcilier l'énoncé avec le contenu de la page à scrapper ?

On lit dans la page 3 colonnes:
 - Account
 - Transaction
 - Amount

Alors que sont demandées:
 - Account
 - Transaction
 - Amount
 - Currency

&rightarrow; on va devoir parser *Amount* pour en extraire *Currency*

On voit bien qu'en suivant le lien `Next -->` on saute les transactions 51 à 100. La pagination via le lien `Next -->` n'est pas fiable.

&rightarrow; on va devoir jouer avec le paramètre d'url `?start=` pour retourner **toutes** les transations.

D'un côté, on remarque que la dernière page est
https://web.bankin.com/challenge/index.html?start=4950

D'un autre côté, on remarque qu'un décalage dans la pagination produit des incohérences :

 - https://web.bankin.com/challenge/index.html?start=0 ==> Transaction 2 = 54€
 - https://web.bankin.com/challenge/index.html?start=1 ==> Transaction 2 = 53€

&rightarrow; Au vu des problèmes fondamantaux dans la pagination du site web, on scrap en dur les pages pour chaque paramètre d'url `?start=` multiple de 50, de 0 à 4950 :
 - https://web.bankin.com/challenge/index.html?start=0
 - https://web.bankin.com/challenge/index.html?start=50
 - ...
 - https://web.bankin.com/challenge/index.html?start=4950

Le format de retour laisse libre cours à interprétation. Il s'agit d'être exhaustif, fiable, en JSON, avec les données *Account*, *Transaction*, *Amount*, *Currency*.

&rightarrow; on choisi un format JSON sûr (i.e. [pas de top-level JSON array](https://stackoverflow.com/q/3503102/1435156)):
```
{
  "transactions": [
    {
      "account": "Checking",
      "transaction": "Transaction 1",
      "amount": 73,
      "currency": "€"
    },
    {
      "account": "Checking",
      "transaction": "Transaction 2",
      "amount": 54,
      "currency": "€"
    },
    ...
  ]
}
```

## Implémentations

### chrome (pour se familiariser)

Cette méthode ne nécessite aucun scrap.

Après avoir ouvert https://web.bankin.com/challenge/index.html?start=0 avec le navigateur Chrome on l'enregistre sur le disque. On peut modifier le contenu de la page et ses scripts. Cela permet de se familiariser avec la page, le html, et reverse engineer le javascript.

On remarque qu'il suffit de modifier le fichier `load.js` pour obtenir un résultat intéressant.

Si vous ouvrez la page index.htm avec Chrome, vous verrez le JSON de sortie s'afficher pleine page à peu de frais (peu de ligne ont été ajoutée dans `load.js`)

`chrome index.htm`

### Rétro ingénierie

Cette méthode ne nécessite aucun scrap.

Une fois qu'on a compris la règle de calcul des transactions, c'est de loin la solution la plus rapide.

`npm run reverse_engineer`

### S'accrocher à la méthode Array.push

Cette méthode nécessite un et un seul scrap de page. Elle fait une hypothèse assez faible sur le javascript et permet de récolter toutes les données en peu de temps.

`npm run full_js`

### puppeteer

On ne fait aucune hypothèse sur le javascript. C'est donc une méthode dans les règles de l'art (ou en tout la plus proche de l'esprit du challenge à mon sens)

`npm run puppeteer`

### jsdom

Alternative à puppeteer mais avec jsdom. Un peu plus lent que puppeteer.

`npm run jsdom`
