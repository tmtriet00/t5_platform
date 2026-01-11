# t5-portal-fe

<div align="center" style="margin: 30px;">
    <a href="https://refine.dev">
    <img alt="refine logo" src="https://refine.ams3.cdn.digitaloceanspaces.com/readme/refine-readme-banner.png">
    </a>
</div>
<br/>

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).

## Getting Started

A React Framework for building internal tools, admin panels, dashboards & B2B apps with unmatched flexibility ✨

Refine's hooks and components simplifies the development process and eliminates the repetitive tasks by providing industry-standard solutions for crucial aspects of a project, including authentication, access control, routing, networking, state management, and i18n.

## Available Scripts

### Running the development server.

```bash
    npm run dev
```

### Building for production.

```bash
    npm run build
```

### Running the production server.

```bash
    npm run start
```

## Clean Code Mindset

- Original: https://www.notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules
- The problem of warning lint
    - It's not enforceable. 
    - If we want to enforce it for new commit / build, we have to set it to error and usually require a big refactoring
        - Side note: We can set lint to error and use lint-staged (lint only commit files) to enforce it for new commit. However, it will not work it we want to enforce it for build
- To solve problem, we use eslint-seatbelt
    - Set all lint to error
    - To avoid overheating, run command `npm run increase-eslint-error` to mark these error as tech debt
    - eslint-seatbelt processor will have transform these error to warning during lint process and if it receive new error count, it will throw error
    - Workflow
        - Daily work: Run `npm run lint` to check lint error and fix
        - Add new lint rule: Run `npm run increase-eslint-error` to mark new error as tech debt and fix for the future
        - Remember only run increase-eslint-error when they're actual new lint error type (don't hack it to bypass lint)

## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **Ant Design** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)
- **Supabase Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)

## License

MIT
