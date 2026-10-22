# TP 3 : Diagrammes de classes (parcours Data)

## Avant : l'existant

```mermaid
classDiagram
  class ReportService {
    -dbFile : URL
    -smtp : object
    +outbox : array
    +history : array
    +loadOrders()
    +generate(month, format, recipient)
  }
  class FreeReportService {
    +generate(month, format, recipient)
  }
  class orders_json
  class fs
  class console
  class SMTP
  ReportService <|-- FreeReportService : hérite mais refuse
  ReportService ..> orders_json : lit
  ReportService ..> fs : utilise readFileSync
  ReportService ..> console : journalise
  ReportService ..> SMTP : envoie par e-mail
```

`ReportService` dépend directement du fichier, de la console et du serveur SMTP, et `FreeReportService` hérite de lui pour refuser une partie de ce qu'il accepte.

## Après : la cible

```mermaid
classDiagram
  class ReportService {
    +generate(month, format, recipient)
  }
  class OrderRepository {
    <<interface>>
    +all()
  }
  class Mailer {
    <<interface>>
    +send(message)
  }
  class Logger {
    <<interface>>
    +info(message)
  }
  class Formatter {
    <<interface>>
    +format(stats)
  }
  class ReportPolicy {
    <<interface>>
    +allows(format, recipient)
  }
  class FormatterRegistry {
    +register(name, formatter)
    +get(name)
  }
  class SalesStats {
    +computeStats(orders, month)
  }
  class EmailAddress {
    +isValid(address)
  }
  class JsonFileOrderRepository
  class SmtpMailer
  class ConsoleLogger
  class CsvFormatter
  class HtmlFormatter
  class JsonFormatter
  class ProPolicy
  class FreePolicy
  class CompositionRoot {
    +buildReportService()
  }
  ReportService --> OrderRepository
  ReportService --> Mailer
  ReportService --> Logger
  ReportService --> FormatterRegistry
  ReportService --> ReportPolicy
  ReportService ..> SalesStats : calcule avec
  ReportService ..> EmailAddress : valide avec
  FormatterRegistry o-- Formatter : contient
  OrderRepository <|.. JsonFileOrderRepository
  Mailer <|.. SmtpMailer
  Logger <|.. ConsoleLogger
  Formatter <|.. CsvFormatter
  Formatter <|.. HtmlFormatter
  Formatter <|.. JsonFormatter
  ReportPolicy <|.. ProPolicy
  ReportPolicy <|.. FreePolicy
  CompositionRoot ..> ReportService : crée et injecte
```

Dans la cible, chaque responsabilité a sa classe : calcul (`SalesStats`), validation (`EmailAddress`), formats (un `Formatter` par format dans un registre), lecture, envoi et journal (interfaces avec une implémentation technique). `ReportService` ne dépend que d'interfaces et de la politique d'accès. L'offre gratuite devient une `FreePolicy` injectée au lieu d'une sous-classe, ce qui règle la violation de Liskov. Seule la `CompositionRoot` crée les objets concrets.
