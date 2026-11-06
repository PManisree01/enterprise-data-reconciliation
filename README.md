# Enterprise Financial Data Analytics & Reconciliation Dashboard

## 📌 Project Overview

This project is an enterprise financial data analytics and reconciliation system developed as part of an internship project.

The system combines structured database records, unstructured server logs, and daily foreign exchange rates to produce a reliable financial dataset and an interactive web dashboard.

The dashboard helps users analyze financial performance, monitor data quality, explore transactions, and download filtered results.

---

## 🎯 Project Objectives

- Extract the latest active user records from the enterprise database.
- Process and clean raw server logs using regular expressions.
- Remove invalid ERROR log records.
- Match transactions with daily EUR-to-USD exchange rates.
- Forward-fill missing exchange rates for continuous financial reconciliation.
- Calculate USD revenue from EUR transaction values.
- Create an interactive financial analytics dashboard.
- Provide filtering, pagination, and CSV export functionality.
- Validate the quality of the reconciled financial data.

---

## 🏗️ Project Workflow

```text
Enterprise Database
        ↓
Active User Extraction
        ↓
Raw Server Logs
        ↓
Regex Data Extraction
        ↓
ERROR Log Filtering
        ↓
Exchange Rate Processing
        ↓
Temporal Data Reconciliation
        ↓
USD Revenue Calculation
        ↓
Final Reconciled Dataset
        ↓
Interactive Web Dashboard