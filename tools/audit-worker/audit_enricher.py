from user_agents import parse


def parse_user_agent(
    user_agent: str | None,
) -> tuple[str | None, str | None, str | None]:
    if not user_agent:
        return None, None, None

    ua = parse(user_agent)

    browser = ua.browser.family
    os_name = ua.os.family

    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    elif ua.is_pc:
        device_type = "desktop"
    else:
        device_type = "other"

    return browser, os_name, device_type
