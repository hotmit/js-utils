Tell the recipient to display the message on screen.
        Once the message is displayed either refresh, redirect or do nothing.

        Support kwargs: all keys in options will be convert to js naming standard (camel case) remote_url => remoteUrl
                redirect:
                    redirect_url {!url}: the redirect url

                ajax-refresh:
                    common_target {!selector}: both local and remote html element, if this is specified
                                                then local_target and remote_target will be overwritten

                    local_target {!selector=}:  the local html element
                    remote_target {!selector=}: the remote html element

                ajax-get, ajax-post:
                    local_target {!selector}: the local html element
                    remote_url {!url}: the remote url to retrieve the content
                    remote_target {?selector}: the remote html element, if none then use the entire content
                    data {!dict=}: the data for the post or the get ajax call

                replace-html, append-html:
                    local_target {!selector}
                    html_content {!html}: the html to be use as the replacement

                ===
                // Method

                block-ui:
                    overlayCSS {dict=}: css overlay for $.blockUI - None use default overlay
                    blockTarget {string=}: css selector for the element
                                            to cover the message (None then use screen overlay)
                bs-modal
                    title {string=}: dialog
                    type {BsDialogType=}: the type of dialog (ie the colour)
                    size {BsDialogSize=}: the size of the dialog

                delay {int=}: number of milliseconds to wait before execute the commands ie redirect/refresh

        :param message: the text or html to be display
        :type display_method: Ajx.DisplayMethod|str
        :param display_method:  the display method
        :type command: Ajx.Command|str
        :param command: the command type
        :type status: Ajx.Status|str
        :param status:  the status
        :param js_on_pre_parse:    the javascript function to be executed before
                                    the AjaxCommand is parsed. If the function return "false" the package
                                    will be ignored.
        :param js_on_post_parse:   the javascript function to be executed after the AjaxCommand is parsed.
                                    Only run after delay is satisfied, and no refresh nor redirect.
        :return:    HttpResponse Json Object