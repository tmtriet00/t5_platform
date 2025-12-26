---
trigger: always_on
---

# General Rule

1. For questions related to AntD, please refer to docs/llm/antd.txt
2. **IMPORTAN** For FE changes always test with browser

# Components
1. Components in src/components are shared components used across the application
2. Components can be in page folder, which mean they're only used for this page

# Interfaces
1. Interfaces in src/interfaces are shared interface used across the application
2. Interfaces can be defined directly inside other file usually is 
 - Component File (for props)
 - Context File

# Naming Convention
1. Filename is kebab-case
2. Component name is Pascalcase