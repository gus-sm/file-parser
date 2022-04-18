define(
    //-------------------------------------------------------------------
    // DEPENDENCIES
    //-------------------------------------------------------------------
    ['jquery', 'knockout', 'notifier', 'ccPasswordValidator', 'pubsub', 'CCi18n', 'ccConstants', 'navigation', 'ccLogger', 'storageApi'],

    //-------------------------------------------------------------------
    // MODULE DEFINITION
    //-------------------------------------------------------------------
    function($, ko, notifier, CCPasswordValidator, pubsub, CCi18n, CCConstants, navigation, ccLogger, storageApi) { 
        \'use strict\';

        return {

            // ---------------------------------------------------------------------------
            // ------------------------------ BEXPERT ------------------------------------
            // ---------------------------------------------------------------------------

            modalMessageType:   ko.observable(''),
            modalMessageText:   ko.observable(''),
            showErrorMessage:   ko.observable(false),
            userCreated:        ko.observable(false),
      
      ignoreBlur:         ko.observable(false),

            titleSingle: 'Você tem {0} notificação',

 titleMultiple: 'Você tem {0} notificações',

            reloadNotificacoes: function(widget) {

widget.queryResultsEndpoint = widget.site().extensionSiteSettings.integrationSettings.queryResultsEndpoint;
       
         widget.OSvCSSEEndpoint = widget.site().extensionSiteSettings.integrationSettings.OSvCSSEEndpoint;   

   
             var userEmail = widget.user().emailAddress();
                if (userEmail) {
                    widget.getInfo(\'SELECT TEXTO, TIPO, MENU_NOTIFICACAO FROM OCC.TEXTO_NOTIFICACAO\',
                        function(data) {
                            widget.textos = {};
                            data.forEach(function(texto) {
                                widget.textos[texto.MENU_NOTIFICACAO] = {
                                    texto: texto.TEXTO,
                                    tipo: texto.TIPO
                                };
        
                    });
                            widget.getInfo(\'SELECT Incident, TIPO FROM OCC.NOTIFICACAO WHERE Incident.PrimaryContact.ParentContact.Emails.Address = '\' + userEmail + \'' AND DATA_VISUALIZACAO IS NULL\',
  
                              function(data) {
                                    var visitas = 0,

                          favoritos = 0,
                                        propostas = 0;

                  data.forEach(function(notificacao) {
                                        var texto = widget.textos[notificacao.TIPO];
                                        if (texto) {

        switch (texto.tipo) {
                                                case VISITA':

                               visitas++;
                                                    break;

                                   case 'FAVORITO':
                                                    favoritos++;
                                                    break;
                                                case 
'PROPOSTA':
                                                    propostas++;

               break;
                                                default:

                 break;
                                            }
                                        }
 
                                   });

                                    $('.notif-visitas-disabled').removeClass('notif-visitas-disabled').addClass('notif-visitas');
                                    $('.notif-favoritos-disabled').removeClass('notif-favoritos-disabled').addClass('notif-favoritos');
                                    $('.notif-propostas-disabled').removeClass('notif-propostas-disabled').addClass('notif-propostas');

                   $('.notif-icon-visitas-disabled').removeClass('notif-icon-visitas-disabled').addClass('notif-icon-visitas');
                                    $('.notif-icon-favoritos-disabled').removeClass('notif-icon-favoritos-disabled').addClass('notif-icon-favoritos');
                                    $('.notif-icon-propostas-disabled').removeClass('notif-icon-propostas-disabled').addClass('notif-icon-propostas');


       var visitasAlt = \'\',
                                        favoritosAlt = \'\',

                 propostasAlt = \'\';
                                    if (visitas > 1)

                 visitasAlt = widget.titleMultiple.replace('{0}', visitas);
                                    else if (visitas == 1)
                                        visitasAlt = widget.titleSingle.replace('{0}', visitas);
                                    else {
                                        $('.notif-visitas').removeClass('notif-visitas').addClass('notif-visitas-disabled');
                                        $('.notif-icon-visitas').removeClass('notif-icon-visitas').addClass('notif-icon-visitas-disabled');

  }

                                    if (favoritos > 1)
                                        favoritosAlt 
= widget.titleMultiple.replace('{0}', favoritos);
                                    else if (favoritos == 1)
   
                                     favoritosAlt = widget.titleSingle.replace('{0}', favoritos);

                   else {
                                        $('.notif-favoritos').removeClass('notif-favoritos').addClass('notif-favoritos-disabled');
                                        $('.notif-icon-favoritos').removeClass('notif-icon-favoritos').addClass('notif-icon-favoritos-disabled');
                                    }

 
                                   if (propostas > 1)
                                        propostasAlt = widget.titleMultiple.replace('{0}', propostas);
                                    else if (propostas == 1)

                             propostasAlt = widget.titleSingle.replace('{0}', propostas);

           else {
                                        $('.notif-propostas').removeClass('notif-propostas').addClass('notif-propostas-disabled');
                                        $('.notif-icon-propostas').removeClass('notif-icon-propostas').addClass('notif-icon-propostas-disabled');
                                    }


                           $('.notif-visitas').attr(visitasAlt);
                                    $('.notif-visitas').text(\'!\');

                                    $('.notif-favoritos').attr(favoritosAlt);

                     $('.notif-favoritos').text(\'!\');

                                    $('.notif-propostas').attr(propostasAlt);
                                    $('.notif-propostas').text(\'!\');

          },
                                function(error) {}
                            );

      },
                        function(error) {}
                    );
                }
            },
   
         // --------------------------- END BEXPERT ----------------------------------

            elementName: 'login-registration-v2',

            modalMessageType: ko.observable(''),
            modalMessageText: ko.observable(''),
            showErrorMessage: ko.observable(false),
            userCreated: ko.observable(false),
    
        ignoreBlur: ko.observable(false),

            onLoad: function(widget) {
                var self = this;

                widget.user().ignoreEmailValidation(false);

                navigation.setLoginHandler(function(data) {
                    widget.user().handleSamlLogin();
                });

                // ---------------------------------------------------------------------------
                // ------------------------------ BEXPERT ------------------------------------
                // ---------------------------------------------------------------------------
                self.reloadNotificacoes(widget);
                $.Topic(\'RESET_NOTIFICACOES_HEADER.memory\').subscribe(function(data) {
                    self.reloadNotificacoes(widget);
        
        });
                // --------------------------- END BEXPERT ----------------------------------

      
          //REDIRECT AFTER LOGIN
                /*$.Topic(pubsub.topicNames.USER_LOGIN_SUCCESSFUL).subscribe(function(obj) {
                \var pagePath = window.location.pathname;
\\\\
avigation.goTo(pagePath);
\\\\});*/

                // To display success notification after redirection from customerProfile page.
                if (widget.user().delaySuccessNotification()) {
                    notifier.sendSuccess(widget.WIDGET_ID, widget.translate('updateSuccessMsg'), true);
                    widget.user().delaySuccessNotification(false);

    }

                // Handle widget responses when registration is successful or invalid
                $.Topic(pubsub.topicNames.USER_AUTO_LOGIN_SUCCESSFUL).subscribe(function(obj) {
                    if (obj.widgetId === widget.WIDGET_ID) {
                        self.userCreated(true);
                        self.hideLoginModal();
                        self.showErrorMessage(false);
                        // Check if page refresh after auto login is completed, before displaying the notifier      
                        $.when(widget.user().autoLoginComplete).then(function() {
                            notifier.clearSuccess(widget.WIDGET_ID);

          notifier.sendSuccess(widget.WIDGET_ID, widget.translate('createAccountSuccess'));       

            $(window).scrollTop('0');
                            widget.user().autoLoginComplete = $.Deferred();
                        });
                    }
                });

                $.Topic(pubsub.topicNames.USER_RESET_PASSWORD_SUCCESS).subscribe(function(data) {
                    self.hideAllSections();

       self.hideLoginModal();
                    notifier.sendSuccess(widget.WIDGET_ID, CCi18n.t('ns.common:resources.resetPasswordMessage'), true);
                });

                $.Topic(pubsub.topicNames.USER_RESET_PASSWORD_FAILURE).subscribe(function(data) {
                    notifier.sendError(widget.WIDGET_ID, data.message, true);
                });

                $.Topic(pubsub.topicNames.USER_PASSWORD_GENERATED).subscribe(function(data) {
                    $('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalOpenedText'));    
                    widget.user().ignoreEmailValidation(false);
                    self.hideAllSections();
                    $('#CC-forgotPasswordSectionPane').show();
                    $('#CC-forgotPwd-input').focus();
                    widget.user().emailAddressForForgottenPwd('');
                    widget.user().emailAddressForForgottenPwd.isModified(false);
                });

                $.Topic(pubsub.topicNames.USER_PASSWORD_EXPIRED).subscribe(function(data) {
                    $('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalOpenedText'));    
                    widget.user().ignoreEmailValidation(false);

           self.hideAllSections();
                    $('#CC-forgotPasswordSectionPane').show();

    $('#CC-forgotPwd-input').focus();
                    widget.user().emailAddressForForgottenPwd('');

           widget.user().emailAddressForForgottenPwd.isModified(false);
                });


                $.Topic(pubsub.topicNames.USER_CREATION_FAILURE).subscribe(function(obj) {
                    if (obj.widgetId === widget.WIDGET_ID) {
                        widget.user().resetPassword();
                        self.modalMessageType(\'error\');
                        self.modalMessageText(obj.message);
                        self.showErrorMessage(true);
                    };
                });

                $.Topic(pubsub.topicNames.USER_LOGIN_FAILURE).subscribe(function(obj) {
                    self.modalMessageType(\'error\');

                    if (obj.errorCode && obj.errorCode === CCConstants.ACCOUNT_ACCESS_ERROR_CODE) {
                        self.modalMessageText(CCi18n.t('ns.common:resources.accountError'));
                    } else {
                        self.modalMessageText(CCi18n.t('ns.common:resources.loginError'));
                    }

                    self.showErrorMessage(true);
                });

                $.Topic(pubsub.topicNames.USER_LOGIN_SUCCESSFUL).subscribe(function(obj) {
                    self.hideLoginModal();
                    self.showErrorMessage(false);
                    notifier.clearSuccess(widget.WIDGET_ID);
                    $('#CC-loginHeader-myAccount').focus();
                    $('#CC-loginHeader-myAccount-mobile').focus();
                    location.reload();
                });

                $.Topic(pubsub.topicNames.USER_LOGOUT_SUCCESSFUL).subscribe(function(obj) {
                    location.href = \'/home\';
                });

                // Replacing pubsub subscription with this. PubSub's getting called multiple times, causing this method to be called multiple times,

     // causing login modal to appear and disappears at times.
                navigation.setLoginHandler(function(data) {

                    // Do a subscription to page ready.
                    $.Topic(pubsub.topicNames.PAGE_READY).subscribe(function(pageEvent) {
                        if (pageEvent) {
                            // 
Check if the pageId is undefined. If so, set it to empty string.
                            if (pageEvent.pageId == undefined) {
                                pageEvent.pageId = \'\';
                            }

                 var loginHandlerPageParts = [];
                            if (navigation.loginHandlerPage) {
  
                              loginHandlerPageParts = navigation.loginHandlerPage.split('/');

       } else if (navigation.loginHandlerPage == \'\') {
                                loginHandlerPageParts = [\'\'];
                            }
                            if ((navigation.loginHandlerPage == undefined) || 
(navigation.loginHandlerPage == null) 
|| (navigation.loginHandlerPage !== \'\' && pageEvent.path !== undefined && 
pageEvent.path !== null && navigation.loginHandlerPage.indexOf(pageEvent.path) == -1)) {

      return;
                            }
                        }
                        if (data && data[0] && data[0].linkToRedirect) {
                            widget.user().pageToRedirect(data[0].linkToRedirect);
  
                          if (widget.user().loggedInUserName() != '' && !widget.user().isUserSessionExpired()) {  
                                widget.user().handleSessionExpired();
                            }

          }

                        setTimeout(function() {
                            $('#CC-headermodalpane').modal('show');
                            self.hideAllSections();
                            self.userCreated(false);
                            $('#CC-loginUserPane').show();
                            $('#CC-headermodalpane').on('shown.bs.modal', function() {
                                if (!widget.user().loggedIn() && !widget.user().isUserLoggedOut() && widget.user().login() &&
                                    widget.user().login() != '' && widget.user().isUserSessionExpired()) {
                                    widget.user().populateUserFromLocalData(true);
                                    $('#CC-login-password-input').focus();

       widget.user().password.isModified(false);
                                } else {

            $('#CC-login-input').focus();
                                    widget.user().login.isModified(false);
                                }
                                // Set the login handler page to null now
   
                             navigation.loginHandlerPage = null;
                            });


             $('#CC-headermodalpane').on('hidden.bs.modal', function() {
                                if (!(self.userCreated() || widget.user().loggedIn()) &&
                                    (($('#CC-loginUserPane').css('display') == 'block') ||
                                        ($('#CC-registerUserPane').css('display') == 'block') ||
                                        ($('#CC-updatePasswordPane').css('display') == 'block') ||

                              ($('#CC-forgotPasswordSectionPane').css('display') == 'block') ||

                     ($('#CC-forgotPasswordMessagePane').css('display') == 'block') ||

            ($('#CC-updatePasswordErrorMessagePane').css('display') == 'block'))) {     

          self.cancelLoginModal(widget);
                                }
                            });
      
                  }, CCConstants.PROFILE_UNAUTHORIZED_DEFAULT_TIMEOUT);
                    });
                });

                // This pubsub checks for the page parameters and if there is a token
                // in the page URL, validates it and then starts the update expired/
                // forgotten password modal.
        
        $.Topic(pubsub.topicNames.PAGE_PARAMETERS).subscribe(function() {
                    var token = this.parameters.occsAuthToken;
                    // Proceed only if there is a token on the parameters

  if (token) {
                        // Validate the token to make sure that it is valid

 // before proceeding to update the password.
                        widget.user().validateTokenForPasswordUpdate(token,
                            // Success callback
                            function(data) {

                   // Let's try and update the password.
                                $('#CC-headermodalpane').modal('show');
                                self.hideAllSections();
                                $('#CC-updatePasswordPane').show();
                                $('#CC-headermodalpane').on('shown.bs.modal', function() {
                                    $('#CC-updatePassword-email').focus();
                                });
  
                          },
                            // Error callback
                            function(data) {
                                // Error function - show error message
                                $('#CC-headermodalpane').modal('show');
                                self.hideAllSections();

         $('#CC-updatePasswordErrorMessagePane').show();
                            });
                    }
  
              });

                $(document).on('hide.bs.modal', '#CC-headermodalpane', function() {

          if ($('#CC-loginUserPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.loginModalClosedText'));        
                    } else if ($('#CC-registerUserPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.registrationModalClosedText')); 
                    } else if ($('#CC-forgotPasswordSectionPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalClosedText'));                    } else if ($('#CC-updatePasswordPane').css('display') == 'block') {
     
                   $('#alert-modal-change').text(CCi18n.t('ns.common:resources.updatePasswordModalClosedText'));
  
                  }
                });
                $(document).on('show.bs.modal', '#CC-headermodalpane', function() {
                    if ($('#CC-loginUserPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.loginModalOpenedText'));        
                    } else if ($('#CC-registerUserPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.registrationModalOpenedText')); 
                    } else if ($('#CC-forgotPasswordSectionPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.resetPasswordModalOpenedText'));                    } else if ($('#CC-updatePasswordPane').css('display') == 'block') {
                        $('#alert-modal-change').text(CCi18n.t('ns.common:resources.updatePasswordModalOpenedText'));
                    }
                });

                // Added handlers to catch the ESC 
button when the password related models are open and closed with 
ESC.
                $(document).on('hidden.bs.modal', '#CC-headermodalpane', function() {
                    if (!(self.userCreated() || widget.user().loggedIn()) &&
                        ($('#CC-updatePasswordMessagePane').css('display') == 'block') ||

     ($('#CC-updatePasswordPane').css('display') == 'block') ||
                        ($('#CC-forgotPasswordSectionPane').css('display') == 'block') ||
                        ($('#CC-forgotPasswordMessagePane').css('display') == 'block') ||
                        ($('#CC-updatePasswordErrorMessagePane').css('display') == 'block')) {
     
                   self.cancelLoginModal(widget)
                    }
                });

                /**
                 * Invoked when SAML login is not successful
                 */
                $.Topic(pubsub.topicNames.SAML_LOGIN_FAILURE).subscribe(function(obj) {
                    storageApi.getInstance().saveToMemory(CCConstants.CC_IS_SSO_LOGIN_FAILURE, true);
                    if (widget.hasOwnProperty(\'user\')) {

        widget.user().handleCancel();
                    if (widget.user().pageToRedirect() && widget.user().pageToRedirect() == widget.links().checkout.route && widget.cart().items().length > 0) {
                        var hash = widget.user().pageToRedirect();
                        widget.user().pageToRedirect(null);

      navigation.goTo(hash);
                    }
                    widget.user().pageToRedirect(null);
      
              notifier.clearError(widget.WIDGET_ID);
                    widget.user().clearUserData();

          widget.user().profileRedirect();
                    } else {
                    // This should not happen
                    navigation.cancelLogin();
                    }
                    notifier.sendError(\'LOGIN_SSO\', CCi18n.t('ns.common:resources.loginError'), true);
                });
            },


/**
             * Invoked when Login method is called
             */
            handleSamlLogin: function(data, event) {
                data.user().handleSamlLogin();
                return true;
            },

        
    /**
             * Invoked when register method is called
             */
            handleSamlRegistration: function(data, event) {
                data.user().handleSamlRegistration();
                return true;
     
       },

            /**
             * Invoked when Logout method is called
             */
            handleLogout: function(data) {
                // returns if the profile has unsaved changes.
                if (data.isUserProfileEdited()) {
                return true;
                }
                // Clearing the auto-login success message
                notifier.clearSuccess(this.WIDGET_ID);
                // Clearing any other notifications
                notifier.clearError(this.WIDGET_ID);
                data.updateLocalData(data.loggedinAtCheckout(), false);
                $.Topic(pubsub.topicNames.USER_LOGOUT_SUBMIT).publishWith([{message: \'success\'}]);
            },

            removeMessageFromPanel: function() {
                var message = this;
 
               var messageId = message.id();
                var messageType = message.type();
                notifier.deleteMessage(messageId, messageType);
            },

            emailAddressFocused: function(data) {
 
               if (this.ignoreBlur && this.ignoreBlur()) {
                    return true;
                }
   
             this.user().ignoreEmailValidation(true);
                return true;
            },

            emailAddressLostFocus: function(data) {
                if (this.ignoreBlur && this.ignoreBlur()) {

     return true;
                }
                this.user().ignoreEmailValidation(false);
                return true;
            },

            passwordFieldFocused: function(data) {
                if (this.ignoreBlur && this.ignoreBlur()) {
                    return true;
                }
                this.user().ignorePasswordValidation(true);
                return true;
            },

            passwordFieldLostFocus: function(data) {
                if (this.ignoreBlur && this.ignoreBlur()) {
                    return true;

     }
                this.user().ignorePasswordValidation(false);
                return true;
            },

            confirmPwdFieldFocused: function(data) {
                if (this.ignoreBlur && this.ignoreBlur()) {
                    return true;
                }
                this.user().ignoreConfirmPasswordValidation(true);
                return true;
            },

            confirmPwdFieldLostFocus: function(data) {
      
          if (this.ignoreBlur && this.ignoreBlur()) {
                    return true;
                }
        
        this.user().ignoreConfirmPasswordValidation(false);
                return true;
            },

       
     handleLabelsInIEModals: function() {
                if (!!(navigator.userAgent.match(/Trident/))) {
        
            $(\'#CC-LoginRegistrationModal label\').removeClass(\'inline\');
                }
            },

 
           /**
             * Registration will be called when register is clicked
             */
            registerUser: function(data, event) {
                if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
                    notifier.clearError(this.WIDGET_ID);
     
               //removing the shipping address if anything is set
                    data.user().shippingAddressBook([]);
                    data.user().updateLocalData(false, false);
                    if (data.user().validateUser()) {
                        $.Topic(pubsub.topicNames.USER_REGISTRATION_SUBMIT).publishWith(data.user(), [{ 
message: \'success\', widgetId: data.WIDGET_ID }]);
                    }
                }
                return true;
            },

            /**
             * this method is invoked to hide the login modal

    */
            hideLoginModal: function() {
                $('#CC-headermodalpane').modal('hide');

       $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
            },

     
       /**
             * Invoked when Login method is called
             */
            handleLogin: function(data, event) {
                console.log('===========================');
                console.log(data.user().login);
                console.log(data.user().password);
                if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
                    notifier.clearError(this.WIDGET_ID);
                    if (data.user().validateLogin()) {
                        data.user().updateLocalData(false, false);
                        $.Topic(pubsub.topicNames.USER_LOGIN_SUBMIT).publishWith(data.user(), [{ message: \'success\' }]);
                    }
                }
                return true;

   },

            /**
             * Invoked when cancel button is clicked on login modal
             */
    
        handleCancel: function(data, event) {
                if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
                    notifier.clearError(this.WIDGET_ID);
                    if (data.user().isUserSessionExpired()) {
                        $.Topic(pubsub.topicNames.USER_LOGOUT_SUBMIT).publishWith([{ message: \'success\' }]);      
                        this.hideLoginModal();
                    }
                }
                return true;
            },

            handleCancelForgottenPassword: function(data, event) {
                if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
                    notifier.clearError(this.WIDGET_ID);
                    //navigation.doLogin(navigation.getPath(), data.links().home.route);
                }
     
           return true;
            },

            handleSuccessForgottenPassword: function(data, event) {
    
            if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode 
=== 13)) {
                    navigation.doLogin(data.links().home.route, data.links().home.route);

   }
                return true;
            },
            /**
             * this method is triggered when the user clicks on the save 
             * on the update password model
             */
            savePassword: 
function(data, event) {

                if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
                    notifier.clearError(this.WIDGET_ID);

     data.user().ignoreConfirmPasswordValidation(false);
                    data.user().ignoreEmailValidation(false);
                    data.user().emailAddressForForgottenPwd.isModified(true);
                    if (data.user().isPasswordValid(true) &&
                        data.user().emailAddressForForgottenPwd &&

      data.user().emailAddressForForgottenPwd.isValid()) {
                        data.user().updateExpiredPasswordUsingToken(data.user().token,
                            data.user().emailAddressForForgottenPwd(), data.user().newPassword(),
                            data.user().confirmPassword(),
                            function(retData) {
                                // Success function
                                data['login-registration-v2'].hideAllSections();
                                $('#CC-updatePasswordMessagePane').show();

                   $('#CC-updatePasswordMsgContinue').focus();
                            },

        function(retData) {
                                // Error function - show error message

                 data['login-registration-v2'].hideAllSections();
                                $('#CC-updatePasswordErrorMessagePane').show();
                            }
                        );
                    }
  
              }
                return true;
            },

            /**
             * Invoked when cancel button is called on 
             */
            cancelLoginModal: function(widget) {
                if (widget.hasOwnProperty(\'user\')) {
                    widget.user().handleCancel();
                    if (widget.user().pageToRedirect() && widget.user().pageToRedirect() == widget.links().checkout.route && widget.cart().items().length > 0) {
                        var hash = widget.user().pageToRedirect();
                        widget.user().pageToRedirect(null);
                        navigation.goTo(hash);
                    } else {

          navigation.cancelLogin();
                    }
                    widget.user().pageToRedirect(null);
                    notifier.clearError(widget.WIDGET_ID);
                    widget.user().clearUserData();
   
                 widget.user().profileRedirect();
                } else {
                    navigation.cancelLogin();
                }
            },

            /**
             * Invoked when Logout method is called
 
            */
            handleLogout: function(data) {
                // returns if the profile has unsaved changes.
                if (data.isUserProfileEdited()) {
                    return true;
                }
    
            // Clearing the auto-login success message
                notifier.clearSuccess(this.WIDGET_ID);
    
            // Clearing any other notifications
                notifier.clearError(this.WIDGET_ID);

   data.updateLocalData(data.loggedinAtCheckout(), false);
                $.Topic(pubsub.topicNames.USER_LOGOUT_SUBMIT).publishWith([{ message: \'success\' }]);
            },

            /**
             * Invoked when the modal dialog for registration is closed
             */
            cancelRegistration: function(data) {

       notifier.clearSuccess(this.WIDGET_ID);
                notifier.clearError(this.WIDGET_ID);

 this.hideLoginModal();
                data.user().reset();
                this.showErrorMessage(false);
      
          data.user().pageToRedirect(null);
            },

            /**
             * Invoked when registration link is clicked
             */
            clickRegistration: function(data) {
                notifier.clearSuccess(this.WIDGET_ID);
                notifier.clearError(this.WIDGET_ID);
                data.reset();
   
             this.hideAllSections();
                $('#CC-registerUserPane').show();
                this.showErrorMessage(false);
                $('#CC-headermodalpane').on('shown.bs.modal', function() {

$('#CC-userRegistration-firstname').focus();
                    data.firstName.isModified(false);

 });
            },

            /**
             * Invoked when login link is clicked
             */
       
     clickLogin: function(data) {
                notifier.clearSuccess(this.WIDGET_ID);
                notifier.clearError(this.WIDGET_ID);
                data.reset();
                this.hideAllSections();

 $('#CC-loginUserPane').show();
                this.showErrorMessage(false);
                $('#CC-headermodalpane').on('shown.bs.modal', function() {
                    if (!data.loggedIn() && data.login() && data.login() != 
'' && data.isUserSessionExpired()) {    
                        data.populateUserFromLocalData(true);

             $('#CC-login-password-input').focus();
                        data.password.isModified(false);
     
               } else {
                        $('#CC-login-input').focus();
                        data.login.isModified(false);
                    }
                    // Set the login handler page to null now

         navigation.loginHandlerPage = null;
                });
            },

            /**
             * Ignores the blur function when mouse click is up
             */
            handleMouseUp: function(data) {
   
             this.ignoreBlur(false);
                data.user().ignoreConfirmPasswordValidation(false);

       return true;
            },

            /**
             * Ignores the blur function when mouse click is down
             */
            handleMouseDown: function(data) {
                this.ignoreBlur(true);
     
           data.user().ignoreConfirmPasswordValidation(true);
                return true;
            },

     
       /**
             * Ignores the blur function when mouse click is down outside the modal dialog(backdrop click).
             */
            handleModalDownClick: function(data, event) {
                if (event.target === event.currentTarget) {
                    this.ignoreBlur(true);
                    this.user().ignoreConfirmPasswordValidation(true);
                }
                return true;
            },

            /**
      
       * Invoked when register is clicked on login modal
             */
            showRegistrationSection: function(data) {
                $('#alert-modal-change').text(CCi18n.t('ns.common:resources.registrationModalOpenedText'));
                this.hideAllSections();
                $('#CC-registerUserPane').show();
                $('#CC-userRegistration-firstname').focus();
                data.user().firstName.isModified(false);

   notifier.clearError(this.WIDGET_ID);
                notifier.clearSuccess(this.WIDGET_ID);
                data.user().reset();
                this.showErrorMessage(false);
            },

            /**
             * 
Invoked when forgotten Password link is clicked.
             */
            showForgotPasswordSection: function(data) {
                $('#alert-modal-change').text(CCi18n.t('ns.common:resources.forgottenPasswordModalOpenedText'));    
                data.ignoreEmailValidation(false);
                this.hideAllSections();

   $('#CC-forgotPasswordSectionPane').show();
                $('#CC-forgotPwd-input').focus();
                data.emailAddressForForgottenPwd('');
                data.emailAddressForForgottenPwd.isModified(false);

  },

            showPrimeiroAcessoSectionPane: function(data) {
                console.log('showPrimeiroAcessoSectionPane');
                $('#alert-modal-change').text(CCi18n.t('ns.common:resources.forgottenPasswordModalOpenedText'));    
                data.ignoreEmailValidation(false);
                this.hideAllSections();
     
           $('#CC-primeiroAcessoSectionPane').show();
                data.emailAddressForForgottenPwd('');
      
          data.emailAddressForForgottenPwd.isModified(false);
            },

            /**
             * Hides all the sections of  modal dialogs.
             */
            hideAllSections: function() {

$('#CC-loginUserPane').hide();
                $('#CC-registerUserPane').hide();
                $('#CC-forgotPasswordSectionPane').hide();
                $('#CC-updatePasswordPane').hide();
                $('#CC-updatePasswordMessagePane').hide();
                $('#CC-forgotPasswordMessagePane').hide();
                $('#CC-updatePasswordErrorMessagePane').hide();
                $('#CC-primeiroAcessoSectionPane').hide();
            },

     
       /**
             * Resets the password for the entered email id.
             */
            resetForgotPassword: function(data, event) {
                if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
                    data.user().ignoreEmailValidation(false);
    
                data.user().emailAddressForForgottenPwd.isModified(true);
                    if (data.user().emailAddressForForgottenPwd && data.user().emailAddressForForgottenPwd.isValid()) {
                        data.user().resetForgotPassword();
                    }
                }
                return true;
            },

  
          openStateSearch: function() {
                $(\'#lightboxMap\').modal({
                    show: true
                });
            }
        };
    }
);

