# Task Tracker

Task Tracker — учебный backend/fullstack-проект для управления проектами, целями, задачами и привычками.

Проект развивается как портфолио-приложение на Java + Spring Boot с PostgreSQL, Docker и простым HTML/CSS/JS фронтендом.

## Стек

- Java 21
- Spring Boot 3.5.9
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL 17
- Flyway
- Maven
- Docker Compose
- HTML / CSS / JavaScript

## Возможности

- Создание проектов
- Создание задач внутри проектов
- Смена статуса задач
- Отображение выполненных задач
- Создание целей
- Привязка целей к проектам
- Привязка задач к целям
- Расчёт прогресса целей по выполненным задачам
- Трекер привычек
- Простая многостраничная навигация
- Хранение данных в PostgreSQL

## Архитектура

Проект разделён на слои:

```text
controller -> service -> repository -> database
```

## Запуск проекта
1) Клонировать репозиторий командой: git clone https://github.com/Nipsar/task-tracker.git
2) перейти в cd task-tracker
3) Запустить PostgreSQL через Docker командой: docker compose up -d
База данных будет доступна на порту: localhost:5433

4) Запустить Spring Boot приложение. 
Windows: mvnw.cmd spring-boot:run
Linux / macOS: ./mvnw spring-boot:run
5) Открыть приложение: http://localhost:8081
