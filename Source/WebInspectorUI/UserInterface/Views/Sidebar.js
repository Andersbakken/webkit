/*
 * Copyright (C) 2013, 2015 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. AND ITS CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE INC. OR ITS CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.Sidebar = class Sidebar extends WebInspector.Object
{
    constructor(element, side, sidebarPanels, role, label)
    {
        super();

        console.assert(!side || side === WebInspector.Sidebar.Sides.Left || side === WebInspector.Sidebar.Sides.Right);
        this._side = side || WebInspector.Sidebar.Sides.Left;

        this._element = element || document.createElement("div");
        this._element.classList.add("sidebar");
        this._element.classList.add(WebInspector.Sidebar.CollapsedStyleClassName);
        this._element.classList.add(this._side);

        this._element.setAttribute("role", role || "group");
        if (label)
            this._element.setAttribute("aria-label", label);

        this._resizer = new WebInspector.Resizer(WebInspector.Resizer.RuleOrientation.Vertical, this);
        this._element.insertBefore(this._resizer.element, this._element.firstChild);

        this._sidebarPanels = [];

        if (sidebarPanels) {
            for (var i = 0; i < sidebarPanels.length; ++i)
                this.addSidebarPanel(sidebarPanels[i]);
        }
    }

    // Public

    addSidebarPanel(sidebarPanel)
    {
        console.assert(sidebarPanel instanceof WebInspector.SidebarPanel);
        if (!(sidebarPanel instanceof WebInspector.SidebarPanel))
            return null;

        console.assert(!sidebarPanel.parentSidebar);
        if (sidebarPanel.parentSidebar)
            return null;

        sidebarPanel._parentSidebar = this;

        this._sidebarPanels.push(sidebarPanel);
        this._element.appendChild(sidebarPanel.element);

        sidebarPanel.added();

        return sidebarPanel;
    }

    removeSidebarPanel(sidebarPanelOrIdentifierOrIndex, index)
    {
        var sidebarPanel = this.findSidebarPanel(sidebarPanelOrIdentifierOrIndex);
        if (!sidebarPanel)
            return null;

        sidebarPanel.willRemove();

        sidebarPanel._parentSidebar = null;

        if (this._selectedSidebarPanel === sidebarPanel) {
            var index = this._sidebarPanels.indexOf(sidebarPanel);
            this.selectedSidebarPanel = this._sidebarPanels[index - 1] || this._sidebarPanels[index + 1] || null;
        }

        this._sidebarPanels.remove(sidebarPanel);
        this._element.removeChild(sidebarPanel.element);

        sidebarPanel.removed();

        return sidebarPanel;
    }

    get selectedSidebarPanel()
    {
        return this._selectedSidebarPanel || null;
    }

    set selectedSidebarPanel(sidebarPanelOrIdentifierOrIndex)
    {
        var sidebarPanel = this.findSidebarPanel(sidebarPanelOrIdentifierOrIndex);
        if (this._selectedSidebarPanel === sidebarPanel)
            return;

        if (this._selectedSidebarPanel) {
            var wasVisible = this._selectedSidebarPanel.visible;

            this._selectedSidebarPanel.selected = false;

            if (wasVisible) {
                this._selectedSidebarPanel.hidden();
                this._selectedSidebarPanel.visibilityDidChange();
            }
        }

        this._selectedSidebarPanel = sidebarPanel || null;

        if (this._selectedSidebarPanel) {
            this._selectedSidebarPanel.selected = true;

            if (this._selectedSidebarPanel.visible) {
                this._selectedSidebarPanel.shown();
                this._selectedSidebarPanel.visibilityDidChange();
            }
        }

        this.dispatchEventToListeners(WebInspector.Sidebar.Event.SidebarPanelSelected);
    }

    get minimumWidth()
    {
        return WebInspector.Sidebar.AbsoluteMinimumWidth;
    }

    get maximumWidth()
    {
        // FIXME: This is kind of arbitrary and ideally would be a more complex calculation based on the
        // available space for the sibling elements.
        return Math.round(window.innerWidth / 3);
    }

    get width()
    {
        return this._element.offsetWidth;
    }

    set width(newWidth)
    {
        if (newWidth === this.width)
            return;

        newWidth = Math.max(this.minimumWidth, Math.min(newWidth, this.maximumWidth));

        this._element.style.width = newWidth + "px";

        if (!this.collapsed && this._selectedSidebarPanel)
            this._selectedSidebarPanel.widthDidChange();

        this.dispatchEventToListeners(WebInspector.Sidebar.Event.WidthDidChange);
    }

    get collapsed()
    {
        return this._element.classList.contains(WebInspector.Sidebar.CollapsedStyleClassName);
    }

    set collapsed(flag)
    {
        if (flag === this.collapsed)
            return;

        if (flag)
            this._element.classList.add(WebInspector.Sidebar.CollapsedStyleClassName);
        else
            this._element.classList.remove(WebInspector.Sidebar.CollapsedStyleClassName);

        if (this._selectedSidebarPanel) {
            if (this._selectedSidebarPanel.visible)
                this._selectedSidebarPanel.shown();
            else
                this._selectedSidebarPanel.hidden();

            this._selectedSidebarPanel.visibilityDidChange();

            this._selectedSidebarPanel.widthDidChange();
        }

        this.dispatchEventToListeners(WebInspector.Sidebar.Event.CollapsedStateDidChange);
        this.dispatchEventToListeners(WebInspector.Sidebar.Event.WidthDidChange);
    }

    get sidebarPanels()
    {
        return this._sidebarPanels;
    }

    get element()
    {
        return this._element;
    }

    get side()
    {
        return this._side;
    }

    findSidebarPanel(sidebarPanelOrIdentifierOrIndex)
    {
        var sidebarPanel = null;

        if (sidebarPanelOrIdentifierOrIndex instanceof WebInspector.SidebarPanel) {
            if (this._sidebarPanels.includes(sidebarPanelOrIdentifierOrIndex))
                sidebarPanel = sidebarPanelOrIdentifierOrIndex;
        } else if (typeof sidebarPanelOrIdentifierOrIndex === "number") {
            sidebarPanel = this._sidebarPanels[sidebarPanelOrIdentifierOrIndex];
        } else if (typeof sidebarPanelOrIdentifierOrIndex === "string") {
            for (var i = 0; i < this._sidebarPanels.length; ++i) {
                if (this._sidebarPanels[i].identifier === sidebarPanelOrIdentifierOrIndex) {
                    sidebarPanel = this._sidebarPanels[i];
                    break;
                }
            }
        }

        return sidebarPanel;
    }

    // Protected

    resizerDragStarted(resizer)
    {
        this._widthBeforeResize = this.width;
    }

    resizerDragging(resizer, positionDelta)
    {
        if (this._side === WebInspector.Sidebar.Sides.Left)
            positionDelta *= -1;

        var newWidth = positionDelta + this._widthBeforeResize;
        this.width = newWidth;
        this.collapsed = (newWidth < (this.minimumWidth / 2));
    }

    resizerDragEnded(resizer)
    {
        delete this._widthBeforeResize;
    }

    // Private

    _navigationItemSelected(event)
    {
        this.selectedSidebarPanel = event.target.selectedNavigationItem ? event.target.selectedNavigationItem.identifier : null;
    }
};

WebInspector.Sidebar.CollapsedStyleClassName = "collapsed";
WebInspector.Sidebar.AbsoluteMinimumWidth = 200;

WebInspector.Sidebar.Sides = {
    Right: "right",
    Left: "left"
};

WebInspector.Sidebar.Event = {
    SidebarPanelSelected: "sidebar-panel-selected",
    CollapsedStateDidChange: "sidebar-collapsed-state-did-change",
    WidthDidChange: "sidebar-width-did-change",
};
